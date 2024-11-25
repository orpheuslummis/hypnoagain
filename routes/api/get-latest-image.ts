import { getLatestImage } from "./process.ts";

export const handler = (req: Request) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  return getLatestImage();
};
