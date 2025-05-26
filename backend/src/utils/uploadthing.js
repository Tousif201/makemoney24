// ============================
// File: utils/uploadthing.js
// ============================
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  secret: process.env.UPLOADTHING_SECRET,
});
