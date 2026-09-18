import type { IncomingMessage, ServerResponse } from "http";

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  const blobUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!blobUrl || typeof blobUrl !== "string") {
    res.statusCode = 400;
    res.end("Missing url parameter");
    return;
  }

  // Security: Only allow proxying Vercel Blob domains
  if (!blobUrl.startsWith("https://") || !blobUrl.includes(".blob.vercel-storage.com")) {
    res.statusCode = 403;
    res.end("Forbidden: Invalid host domain");
    return;
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const fetchHeaders: Record<string, string> = {};
    if (token) {
      fetchHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(blobUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok) {
      res.statusCode = response.status;
      res.end(`Failed to fetch blob: ${response.statusText}`);
      return;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const arrayBuffer = await response.arrayBuffer();
    res.statusCode = 200;
    res.end(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("[GET /api/reviews/image] Error proxying blob:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
