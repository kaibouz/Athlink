import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { storeUpload } from "@/lib/server/storage";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Profile photo upload for any signed-in member; returns the public URL. */
export async function POST(req: Request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const form = (await req.formData().catch(() => null)) as unknown as { get(n: string): FormDataEntryValue | null } | null;
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "MISSING_FILE" }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  try {
    return NextResponse.json({ url: await storeUpload(file, "avatars", user.id, ext) });
  } catch (err) {
    if (err instanceof Error && err.message === "STORAGE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "STORAGE_NOT_CONFIGURED" }, { status: 503 });
    }
    throw err;
  }
}
