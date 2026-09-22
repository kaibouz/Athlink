import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getClerkSessionUser } from "@/lib/clerk-auth-server";

const MAX_BYTES = 40 * 1024 * 1024; // 40MB
const ALLOWED = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function resolveAuthedUser() {
  let user = null;
  if (process.env.DATABASE_URL) {
    try {
      user = await getCurrentUser();
    } catch {
      user = null;
    }
  }
  if (!user) user = await getClerkSessionUser();
  return user;
}

/**
 * Store a member-uploaded clip/poster under public/uploads/sns/.
 * Returns a public URL usable in social_posts.video_url / poster_url.
 */
export async function POST(req: Request) {
  const user = await resolveAuthedUser();
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

  const dir = path.join(process.cwd(), "public", "uploads", "sns");
  await mkdir(dir, { recursive: true });
  const name = `${user.id.slice(0, 12)}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);

  const url = `/uploads/sns/${name}`;
  return NextResponse.json({
    url,
    kind: mime.startsWith("image/") ? "image" : "video",
    bytes: file.size,
  });
}
