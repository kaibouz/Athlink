import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";
import type { User, UserRole } from "@/types";
import { isExecutiveEmail } from "@/lib/admin-auth";

export const SESSION_COOKIE = "athlink_session";
const SESSION_DAYS = 30;
export const PUBLIC_SIGNUP_ROLES: UserRole[] = ["athlete", "coach", "parent"];

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function sessionExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d;
}

export function toPublicUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatarUrl: row.avatarUrl ?? undefined,
  };
}

export async function createSession(userId: string) {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const id = `sess-${randomBytes(8).toString("hex")}`;
  const expiresAt = sessionExpiry();

  await db.insert(sessions).values({ id, userId, token, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const now = new Date();
  const [result] = await db
    .select({
      user: users,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result || result.expiresAt <= now) {
    if (token) {
      await db.delete(sessions).where(eq(sessions.token, token));
    }
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return toPublicUser(result.user);
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}) {
  if (!PUBLIC_SIGNUP_ROLES.includes(input.role)) {
    throw new Error("ROLE_FORBIDDEN");
  }

  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const id = `u-${randomBytes(6).toString("hex")}`;
  const passwordHash = await hashPassword(input.password);
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(input.name || email)}`;

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name: input.name.trim(),
    role: input.role,
    avatarUrl,
  });

  await createSession(id);
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return toPublicUser(user);
}

export async function loginUser(email: string, password: string) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const [row] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (!row) throw new Error("INVALID_CREDENTIALS");

  const valid = await verifyPassword(password, row.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  await createSession(row.id);
  return toPublicUser(row);
}

export async function registerExecutive(input: {
  email: string;
  password: string;
  name: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!isExecutiveEmail(email)) {
    throw new Error("EMAIL_DOMAIN_FORBIDDEN");
  }

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const id = `u-${randomBytes(6).toString("hex")}`;
  const passwordHash = await hashPassword(input.password);
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(input.name || email)}`;

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name: input.name.trim(),
    role: "executive",
    avatarUrl,
  });

  await createSession(id);
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return toPublicUser(user);
}

export async function loginExecutive(email: string, password: string) {
  const user = await loginUser(email, password);
  if (user.role !== "executive") {
    await destroySession();
    throw new Error("NOT_EXECUTIVE");
  }
  return user;
}

export async function requireExecutive(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.role !== "executive") throw new Error("FORBIDDEN");
  return user;
}
