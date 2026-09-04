import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { users } from "@/db/schema";
import { toPublicUser } from "@/lib/auth-server";
import type { User, UserRole } from "@/types";

/**
 * Clerk is canonical for public members. Admin/executive auth is a separate
 * system (athlink_session cookie + bcrypt) and is never reachable from here:
 * CLERK_ASSIGNABLE_ROLES excludes "executive", and an existing executive row
 * is never linked to a Clerk identity.
 */
export const CLERK_ASSIGNABLE_ROLES: UserRole[] = ["athlete", "coach", "parent"];

const DEFAULT_CLERK_ROLE: UserRole = "athlete";

/**
 * clerkMiddleware / auth() blow up when the instance keys are absent (fresh
 * Vercel projects, local checkouts without secrets). Mirror the guard used in
 * src/middleware.ts so those builds keep booting.
 */
export function hasClerkKeys(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

export function isClerkAssignableRole(value: unknown): value is UserRole {
  return typeof value === "string" && CLERK_ASSIGNABLE_ROLES.includes(value as UserRole);
}

/**
 * Clerk members never authenticate with a password, but users.password_hash is
 * NOT NULL. Store a value that can never be a bcrypt digest so verifyPassword()
 * rejects it structurally rather than by comparison.
 */
function unusablePasswordHash() {
  return `clerk:${randomBytes(24).toString("hex")}`;
}

function avatarFor(name: string, email: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`;
}

type ClerkIdentity = {
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  metadataRole: UserRole | null;
};

async function readClerkIdentity(): Promise<ClerkIdentity | null> {
  if (!hasClerkKeys()) return null;

  const { auth, currentUser } = await import("@clerk/nextjs/server");

  const session = await auth();
  if (!session.userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";
  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email.split("@")[0];

  const metadataRole = clerkUser.publicMetadata?.role;

  return {
    clerkId: session.userId,
    email: email.trim().toLowerCase(),
    name,
    imageUrl: clerkUser.imageUrl,
    metadataRole: isClerkAssignableRole(metadataRole) ? metadataRole : null,
  };
}

/**
 * Session-only view of a Clerk member. Used when the database is unreachable or
 * has not had the clerk_id migration applied yet, so sign-in still resolves to
 * a usable app user instead of leaving the client in a redirect loop.
 */
function ephemeralUser(identity: ClerkIdentity): User {
  return {
    id: identity.clerkId,
    email: identity.email,
    name: identity.name,
    role: identity.metadataRole ?? DEFAULT_CLERK_ROLE,
    avatarUrl: avatarFor(identity.name, identity.email, identity.imageUrl) || undefined,
  };
}

async function reconcile(identity: ClerkIdentity): Promise<User> {
  const db = getDb();

  const [byClerkId] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, identity.clerkId))
    .limit(1);

  if (byClerkId) {
    const patch: Partial<typeof users.$inferInsert> = {};
    if (byClerkId.email !== identity.email) patch.email = identity.email;
    if (identity.metadataRole && byClerkId.role !== identity.metadataRole) {
      patch.role = identity.metadataRole;
    }
    if (Object.keys(patch).length > 0) {
      patch.updatedAt = new Date();
      await db.update(users).set(patch).where(eq(users.id, byClerkId.id));
      return toPublicUser({ ...byClerkId, ...patch } as typeof users.$inferSelect);
    }
    return toPublicUser(byClerkId);
  }

  const [byEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, identity.email))
    .limit(1);

  if (byEmail) {
    // Admin accounts stay on the password system. Never hand an executive row
    // to a Clerk identity, and never widen a Clerk identity to executive.
    if (byEmail.role === "executive") {
      return ephemeralUser(identity);
    }
    await db
      .update(users)
      .set({ clerkId: identity.clerkId, updatedAt: new Date() })
      .where(eq(users.id, byEmail.id));
    return toPublicUser({ ...byEmail, clerkId: identity.clerkId });
  }

  const id = `u-${randomBytes(6).toString("hex")}`;
  await db
    .insert(users)
    .values({
      id,
      email: identity.email,
      clerkId: identity.clerkId,
      passwordHash: unusablePasswordHash(),
      name: identity.name,
      role: identity.metadataRole ?? DEFAULT_CLERK_ROLE,
      avatarUrl: avatarFor(identity.name, identity.email, identity.imageUrl),
    })
    .onConflictDoNothing();

  const [created] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, identity.clerkId))
    .limit(1);

  return created ? toPublicUser(created) : ephemeralUser(identity);
}

/**
 * Resolve the Clerk session into the app user model, upserting into `users`
 * keyed by Clerk id. Returns null when Clerk is unconfigured or nobody is
 * signed in; never throws.
 */
export async function getClerkSessionUser(): Promise<User | null> {
  let identity: ClerkIdentity | null = null;
  try {
    identity = await readClerkIdentity();
  } catch {
    return null;
  }
  if (!identity) return null;

  if (!isDatabaseConfigured()) return ephemeralUser(identity);

  try {
    return await reconcile(identity);
  } catch {
    return ephemeralUser(identity);
  }
}

/** Persist a role change for the signed-in Clerk member. */
export async function setClerkUserRole(role: UserRole): Promise<User | null> {
  if (!CLERK_ASSIGNABLE_ROLES.includes(role)) return null;

  let identity: ClerkIdentity | null = null;
  try {
    identity = await readClerkIdentity();
  } catch {
    return null;
  }
  if (!identity) return null;

  const withRole: ClerkIdentity = { ...identity, metadataRole: role };
  if (!isDatabaseConfigured()) return ephemeralUser(withRole);

  try {
    const current = await reconcile(withRole);
    if (current.role === role) return current;
    // reconcile() refuses to touch executive rows; leave them alone.
    if (current.id === identity.clerkId) return current;
    const db = getDb();
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.clerkId, identity.clerkId));
    return { ...current, role };
  } catch {
    return ephemeralUser(withRole);
  }
}
