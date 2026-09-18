import type { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";
import { Filter } from "mongodb";
import { getReviewsCollection, ReviewDocument } from "../lib/mongodb";

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body: any;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, "") // strip HTML tags
    .trim();
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

function hashIp(ip: string): string {
  const salt = process.env.REVIEW_RATE_LIMIT_SALT || "avelric_default_review_salt_2026";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ——— GET: Fetch approved reviews & ratings summary ———
  if (req.method === "GET") {
    try {
      const collection = await getReviewsCollection();

      const { productId, rating, hasPhotos, sort, page = "1", limit = "20" } = req.query;

      const pageNum = Math.max(1, parseInt(Array.isArray(page) ? page[0] : page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(Array.isArray(limit) ? limit[0] : limit, 10) || 20));

      const filter: Filter<ReviewDocument> = { status: "approved" };

      const prodId = typeof productId === "string" ? productId.trim() : "";
      const shopifyId = typeof req.query.shopifyProductId === "string" ? (req.query.shopifyProductId as string).trim() : "";
      const handle = typeof req.query.handle === "string" ? (req.query.handle as string).trim() : "";

      const rawIds = [prodId, shopifyId, handle].filter(Boolean);
      const orConditions: any[] = [];

      for (const idStr of rawIds) {
        const escaped = idStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`^${escaped}$`, "i");
        orConditions.push({ shopifyProductId: regex });
        orConditions.push({ productHandle: regex });

        const numMatch = idStr.match(/\d{5,}/);
        if (numMatch) {
          orConditions.push({ shopifyProductId: new RegExp(numMatch[0] + "$", "i") });
        }
      }

      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }

      if (rating) {
        const ratingVal = parseInt(Array.isArray(rating) ? rating[0] : rating, 10);
        if (ratingVal >= 1 && ratingVal <= 5) {
          filter.rating = ratingVal;
        }
      }

      if (hasPhotos === "true") {
        filter["images.0"] = { $exists: true };
      }

      // Sort ordering
      let sortObj: any = { createdAt: -1 };
      if (sort === "highest") sortObj = { rating: -1, createdAt: -1 };
      else if (sort === "lowest") sortObj = { rating: 1, createdAt: -1 };
      else if (sort === "helpful") sortObj = { helpfulCount: -1, createdAt: -1 };

      // Query database with strict projection (privacy protection)
      const [reviews, totalMatching] = await Promise.all([
        collection
          .find(filter, {
            projection: {
              customerEmail: 0,
              ipHash: 0,
            },
          })
          .sort(sortObj)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .toArray(),
        collection.countDocuments(filter),
      ]);

      // Calculate rating summary for this product / store
      const summaryFilter: Filter<ReviewDocument> =
        orConditions.length > 0
          ? { status: "approved", $or: orConditions }
          : { status: "approved" };

      const allApproved = await collection
        .find(summaryFilter, { projection: { rating: 1 } })
        .toArray();

      const totalReviews = allApproved.length;
      let averageRating = 0;
      const distribution = [5, 4, 3, 2, 1].map((star) => {
        const count = allApproved.filter((r) => Math.round(r.rating) === star).length;
        return {
          star,
          count,
          percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
        };
      });

      if (totalReviews > 0) {
        const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
        averageRating = Math.round((sum / totalReviews) * 10) / 10;
      }

      // Format response
      const formattedReviews = reviews.map((r) => ({
        id: r._id ? r._id.toString() : "",
        shopifyProductId: r.shopifyProductId,
        productHandle: r.productHandle,
        productTitle: r.productTitle,
        authorName: r.customerName,
        location: r.location,
        rating: r.rating,
        headline: r.title,
        comment: r.review,
        images: r.images || [],
        photos: r.images || [],
        verifiedPurchase: Boolean(r.verifiedPurchase),
        helpfulCount: r.helpfulCount || 0,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      }));

      res.status(200).json({
        reviews: formattedReviews,
        summary: {
          averageRating,
          totalReviews,
          distribution,
        },
        pagination: {
          page: pageNum,
          totalPages: Math.ceil(totalMatching / limitNum) || 1,
          totalReviews: totalMatching,
          hasMore: pageNum * limitNum < totalMatching,
        },
      });
      return;
    } catch (err) {
      console.error("[GET /api/reviews] Error fetching reviews:", err);
      res.status(500).json({
        error: "Unable to retrieve reviews at this time.",
        reviews: [],
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: [5, 4, 3, 2, 1].map((s) => ({ star: s, count: 0, percentage: 0 })),
        },
      });
      return;
    }
  }

  // ——— POST: Submit new product review ———
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body) {
        res.status(400).json({ error: "Invalid JSON request payload." });
        return;
      }

      // Honeypot spam check
      if (body.website_hp) {
        // Silently accept spam bot submissions without writing to DB
        res.status(201).json({
          success: true,
          message: "Thank you! Your review has been submitted.",
        });
        return;
      }

      const clientIp = getClientIp(req);
      const ipHash = hashIp(clientIp);

      const collection = await getReviewsCollection();

      // Rate limit check: max 3 reviews per IP in 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentCount = await collection.countDocuments({
        ipHash,
        createdAt: { $gte: tenMinutesAgo },
      });

      if (recentCount >= 3) {
        res.status(429).json({
          error: "You have submitted multiple reviews recently. Please wait a few minutes before submitting again.",
        });
        return;
      }

      // Payload extraction and sanitization
      const customerName = sanitizeText(body.customerName || "");
      const customerEmail = (body.customerEmail || "").trim().toLowerCase();
      const title = sanitizeText(body.title || body.headline || "");
      const review = sanitizeText(body.review || body.comment || "");
      const location = sanitizeText(body.location || "");
      const rating = parseInt(body.rating, 10);
      const shopifyProductId = (body.shopifyProductId || "").trim();
      const productHandle = (body.productHandle || body.productId || "").trim().toLowerCase();
      const productTitle = sanitizeText(body.productTitle || "");

      // Validation
      if (!customerName || customerName.length < 2 || customerName.length > 80) {
        res.status(400).json({ error: "Please enter your name (2-80 characters)." });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customerEmail || !emailRegex.test(customerEmail) || customerEmail.length > 120) {
        res.status(400).json({ error: "Please enter a valid email address." });
        return;
      }

      if (isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({ error: "Please select a rating between 1 and 5 stars." });
        return;
      }

      if (!title || title.length < 2 || title.length > 120) {
        res.status(400).json({ error: "Please provide a review headline (2-120 characters)." });
        return;
      }

      if (!review || review.length < 10 || review.length > 2000) {
        res.status(400).json({ error: "Please write a review comment (10-2000 characters)." });
        return;
      }

      if (!productHandle && !shopifyProductId) {
        res.status(400).json({ error: "Product reference is required." });
        return;
      }

      // Validate images array if present (max 4 URLs)
      let validImages: string[] = [];
      const isValidImageUrl = (url: any) =>
        typeof url === "string" &&
        (url.startsWith("https://") || url.startsWith("http://") || url.startsWith("data:image/") || url.startsWith("/api/reviews/image"));

      if (Array.isArray(body.images)) {
        validImages = body.images.filter(isValidImageUrl).slice(0, 4);
      } else if (Array.isArray(body.photos)) {
        validImages = body.photos.filter(isValidImageUrl).slice(0, 4);
      }

      // Phase 1 Rule: verifiedPurchase defaults strictly to false unless authenticated Shopify order verification is established
      const verifiedPurchase = false;

      const newDoc: ReviewDocument = {
        shopifyProductId: shopifyProductId || productHandle,
        productHandle: productHandle || shopifyProductId,
        productTitle: productTitle || "Avelric Curation",
        customerName,
        customerEmail,
        rating,
        title,
        review,
        location: location || undefined,
        images: validImages,
        verifiedPurchase,
        status: "approved", // Auto-approved for genuine review visibility
        helpfulCount: 0,
        ipHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newDoc);

      res.status(201).json({
        success: true,
        message: "Thank you! Your review has been published.",
        review: {
          id: result.insertedId.toString(),
          shopifyProductId: newDoc.shopifyProductId,
          productHandle: newDoc.productHandle,
          productTitle: newDoc.productTitle,
          authorName: newDoc.customerName,
          location: newDoc.location,
          rating: newDoc.rating,
          headline: newDoc.title,
          comment: newDoc.review,
          images: newDoc.images,
          verifiedPurchase: newDoc.verifiedPurchase,
          helpfulCount: 0,
          createdAt: newDoc.createdAt.toISOString(),
        },
      });
      return;
    } catch (err) {
      console.error("[POST /api/reviews] Error submitting review:", err);
      res.status(500).json({ error: "Failed to submit review. Please try again." });
      return;
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
