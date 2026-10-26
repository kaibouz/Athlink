import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/current-user";
import { storeUpload } from "@/lib/server/storage";

const MAX_BYTES = 40 * 1024 * 1024; // 40MB
const ALLOWED = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Store a member-uploaded clip/poster (Vercel Blob in production, public/uploads locally).
 * Returns a public URL usable in social_posts.video_url / poster_url.
 */
export async function POST(req: Request) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "athlete") {
    return NextResponse.json({ error: "ATHLETE_ONLY" }, { status: 403 });
  }

  let form: Awaited<ReturnType<Request["formData"]>>;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });
  }
  // Cast: React/Node FormData ambient merges can omit `.get` under tsc.
  const file = (form as unknown as { get(name: string): FormDataEntryValue | null }).get(
    "file",
  );
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "MISSING_FILE" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 400 });
  }

  const ext =
    mime === "video/webm"
      ? "webm"
      : mime === "video/quicktime"
        ? "mov"
        : mime === "image/png"
          ? "png"
          : mime === "image/webp"
            ? "webp"
            : mime.startsWith("image/")
              ? "jpg"
              : "mp4";

  let url: string;
  try {
    url = await storeUpload(file, "sns", user.id, ext);
  } catch (err) {
    if (err instanceof Error && err.message === "STORAGE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "STORAGE_NOT_CONFIGURED" }, { status: 503 });
    }
    throw err;
  }
  return NextResponse.json({
    url,
    kind: mime.startsWith("image/") ? "image" : "video",
    bytes: file.size,
  });
}
