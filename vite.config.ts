import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import url from "url";

function apiDevMiddleware(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        try {
          const parsedUrl = url.parse(req.url, true);
          const pathname = parsedUrl.pathname || "";

          // Polyfill Vercel Serverless response helpers
          const vercelRes: any = res;
          vercelRes.status = (code: number) => {
            res.statusCode = code;
            return vercelRes;
          };
          vercelRes.json = (data: any) => {
            if (!res.headersSent) {
              res.setHeader("Content-Type", "application/json");
            }
            res.end(JSON.stringify(data));
          };
          vercelRes.send = (data: any) => {
            res.end(data);
          };

          const vercelReq: any = req;
          vercelReq.query = parsedUrl.query;

          // Parse body if present for POST requests
          if (req.method === "POST" || req.method === "PUT") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            const buffer = Buffer.concat(chunks);
            const contentType = req.headers["content-type"] || "";
            if (contentType.includes("application/json")) {
              try {
                vercelReq.body = JSON.parse(buffer.toString("utf-8"));
              } catch {
                vercelReq.body = {};
              }
            } else {
              vercelReq.body = buffer;
            }
          }

          if (pathname === "/api/reviews") {
            const { default: reviewsHandler } = await server.ssrLoadModule("/api/reviews/index.ts");
            await reviewsHandler(vercelReq, vercelRes);
            return;
          } else if (pathname === "/api/reviews/upload") {
            const { default: uploadHandler } = await server.ssrLoadModule("/api/reviews/upload.ts");
            await uploadHandler(vercelReq, vercelRes);
            return;
          } else if (pathname === "/api/reviews/helpful") {
            const { default: helpfulHandler } = await server.ssrLoadModule("/api/reviews/helpful.ts");
            await helpfulHandler(vercelReq, vercelRes);
            return;
          } else if (pathname === "/api/reviews/image") {
            const { default: imageHandler } = await server.ssrLoadModule("/api/reviews/image.ts");
            await imageHandler(vercelReq, vercelRes);
            return;
          } else if (pathname === "/api/instagram/media") {
            const { default: instagramMediaHandler } = await server.ssrLoadModule("/api/instagram/media.ts");
            await instagramMediaHandler(vercelReq, vercelRes);
            return;
          }

          next();
        } catch (err: any) {
          console.error("[Vite API Dev Middleware Error]:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err?.message || "Internal Server Error" }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), apiDevMiddleware()],
    server: {
      allowedHosts: [
        "demise-factual-headsman.ngrok-free.dev",
        ".ngrok-free.dev",
        "localhost",
      ],
    },
    ssr: {
      external: ["mongodb", "@vercel/blob"],
    },
  };
});

