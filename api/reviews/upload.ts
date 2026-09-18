import type { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";
import { put } from "@vercel/blob";

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

function detectImageType(buffer: Buffer): "jpeg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  // WebP: RIFF .... WEBP
  const riff = buffer.toString("ascii", 0, 4);
  const webp = buffer.toString("ascii", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return "webp";
  }

  return null;
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
    let imageBuffer: Buffer;
    let extension = "webp";

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const base64Data = body.base64 || body.image || "";

      if (!base64Data) {
        res.status(400).json({ error: "No image payload provided." });
        return;
      }

      // Strip data URI prefix if present: "data:image/jpeg;base64,..."
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(cleanBase64, "base64");
    } else {
      // Direct raw binary stream
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
      }
      imageBuffer = Buffer.concat(chunks);
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      res.status(400).json({ error: "Empty image received." });
      return;
    }

    // Enforce 5 MB maximum file size limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (imageBuffer.length > MAX_SIZE) {
      res.status(400).json({ error: "Image size exceeds 5MB limit." });
      return;
    }

    // Verify magic bytes for real image content (blocks scripts, SVGs, EXEs)
    const detectedType = detectImageType(imageBuffer);
    if (!detectedType) {
      res.status(400).json({
        error: "Invalid image format. Only JPEG, PNG, and WebP are allowed.",
      });
      return;
    }
    extension = detectedType;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const isLocalToken = !token || token.includes("local") || token.includes("dummy") || token.includes("...");

    if (isLocalToken) {
      // Local development fallback: Return data URL so local testing with photos works without external cloud storage
      const mimeMap = {
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
      };
      const base64Data = imageBuffer.toString("base64");
      res.status(200).json({
        success: true,
        url: `data:${mimeMap[detectedType]};base64,${base64Data}`,
      });
      return;
    }

    // Unique randomized path preventing collisions and path traversal
    const randomId = crypto.randomUUID();
    const filename = `reviews/${Date.now()}-${randomId}.${extension}`;

    const mimeMap = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    let blob;
    try {
      blob = await put(filename, imageBuffer, {
        access: "public",
        contentType: mimeMap[detectedType],
        token,
      });
    } catch (putErr: any) {
      if (
        putErr?.message?.includes("Cannot use public access on a private store") ||
        putErr?.message?.includes("private store")
      ) {
        console.warn("[Upload] Vercel Blob store is configured as private. Uploading with access: 'private'...");
        blob = await put(filename, imageBuffer, {
          access: "private",
          contentType: mimeMap[detectedType],
          token,
        });
      } else {
        throw putErr;
      }
    }

    // If the blob is from a private store, route through the authenticated proxy so browsers can render it without 403
    let publicUrl = blob.url;
    if (blob.url.includes("private.blob.vercel-storage.com")) {
      publicUrl = `/api/reviews/image?url=${encodeURIComponent(blob.url)}`;
    }

    res.status(200).json({
      success: true,
      url: publicUrl,
    });
    return;
  } catch (err) {
    console.error("[POST /api/reviews/upload] Upload error:", err);
    res.status(500).json({
      error: "Failed to upload image. Please try again.",
    });
    return;
  }
}
