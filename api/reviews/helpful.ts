import type { IncomingMessage, ServerResponse } from "http";
import { ObjectId } from "mongodb";
import { getReviewsCollection } from "../lib/mongodb";

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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const reviewId = (body?.reviewId || "").trim();

    if (!reviewId || !ObjectId.isValid(reviewId)) {
      res.status(400).json({ error: "A valid reviewId is required." });
      return;
    }

    const collection = await getReviewsCollection();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(reviewId), status: "approved" },
      { $inc: { helpfulCount: 1 } },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: "Review not found." });
      return;
    }

    res.status(200).json({
      success: true,
      helpfulCount: result.helpfulCount || 1,
    });
    return;
  } catch (err) {
    console.error("[POST /api/reviews/helpful] Error:", err);
    res.status(500).json({ error: "Failed to register helpful vote." });
    return;
  }
}
