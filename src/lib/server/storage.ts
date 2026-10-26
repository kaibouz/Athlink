import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

/**
 * Persist an uploaded file and return its public URL.
 *
 * Production (Vercel) has no writable, persistent disk — anything written to
 * public/ disappears on the next deploy or cold start — so uploads go to
 * Vercel Blob there (BLOB_READ_WRITE_TOKEN). Local dev writes to
 * public/uploads so it works offline.
 */
export async function storeUpload(file: File, folder: string, ownerId: string, ext: string): Promise<string> {
  const name = `${ownerId.slice(0, 12)}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) throw new Error("STORAGE_NOT_CONFIGURED");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}
