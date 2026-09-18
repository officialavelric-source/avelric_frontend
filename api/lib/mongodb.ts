import { MongoClient, Db, Collection, ObjectId } from "mongodb";

export interface ReviewDocument {
  _id?: ObjectId;
  shopifyProductId: string;   // Canonical Shopify GID, e.g. "gid://shopify/Product/12345678"
  productHandle: string;      // Product URL handle, e.g. "men-s-relaxed-fit-jeans"
  productTitle: string;       // Snapshot of product title
  customerName: string;       // Sanitized author name: "Arjun M."
  customerEmail: string;      // Customer email (kept private, omitted from public GET responses)
  rating: number;             // 1 to 5
  title: string;              // Headline
  review: string;             // Review body
  location?: string;          // e.g. "Chandigarh, PB"
  images: string[];           // Array of Vercel Blob public HTTPS URLs
  verifiedPurchase: boolean;  // False by default in Phase 1
  status: "approved" | "pending" | "rejected";
  helpfulCount: number;       // Default 0
  ipHash: string;             // Salted SHA-256 hash for spam protection
  createdAt: Date;
  updatedAt: Date;
}

function resolveMongoUri(): string {
  let envUri = (process.env.MONGODB_URI || "").trim();
  // Strip surrounding quotes if present from .env file
  if (
    (envUri.startsWith('"') && envUri.endsWith('"')) ||
    (envUri.startsWith("'") && envUri.endsWith("'"))
  ) {
    envUri = envUri.slice(1, -1).trim();
  }
  if (
    !envUri ||
    envUri.includes("<username>") ||
    envUri.includes("<password>")
  ) {
    console.log("[MongoDB] Unfilled template detected. Falling back to local MongoDB at mongodb://127.0.0.1:27017/avelric");
    return "mongodb://127.0.0.1:27017/avelric";
  }
  return envUri;
}

const dbName = process.env.MONGODB_DB_NAME || "avelric";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoIndexesEnsured: boolean | undefined;
}

async function createClientConnection(): Promise<MongoClient> {
  const targetUri = resolveMongoUri();
  try {
    const client = new MongoClient(targetUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    return await client.connect();
  } catch (err: any) {
    if (targetUri !== "mongodb://127.0.0.1:27017/avelric") {
      console.warn(`[MongoDB] Primary connection failed (${err?.message}). Falling back to local MongoDB at mongodb://127.0.0.1:27017/avelric...`);
      const fallbackClient = new MongoClient("mongodb://127.0.0.1:27017/avelric", {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3000,
      });
      return await fallbackClient.connect();
    }
    throw err;
  }
}

export async function getDatabase(): Promise<Db> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientConnection();
  }
  try {
    const connectedClient = await global._mongoClientPromise;
    return connectedClient.db(dbName);
  } catch (err) {
    global._mongoClientPromise = undefined; // Reset on failure so next request can retry cleanly
    throw err;
  }
}

export async function getReviewsCollection(): Promise<Collection<ReviewDocument>> {
  const db = await getDatabase();
  const collection = db.collection<ReviewDocument>("reviews");

  // Ensure optimized indexes once per runtime
  if (!global._mongoIndexesEnsured) {
    try {
      await Promise.all([
        collection.createIndex({ shopifyProductId: 1, status: 1, createdAt: -1 }),
        collection.createIndex({ productHandle: 1, status: 1, createdAt: -1 }),
        collection.createIndex({ status: 1, createdAt: -1 }),
        collection.createIndex({ ipHash: 1, createdAt: -1 }),
      ]);
      global._mongoIndexesEnsured = true;
    } catch (err) {
      console.warn("[MongoDB] Index creation warning:", err);
    }
  }

  return collection;
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientConnection();
  }
  return global._mongoClientPromise;
}

export default getMongoClientPromise;
