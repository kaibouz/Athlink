import { randomBytes } from "crypto";
import { getDb, isDatabaseConfigured } from "@/db";
import { adminAuditLog } from "@/db/schema";

export async function logAdminAction(input: {
  adminUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isDatabaseConfigured()) return;
  try {
    await getDb().insert(adminAuditLog).values({
      id: `aud-${randomBytes(6).toString("hex")}`,
      adminUserId: input.adminUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
    });
  } catch {
    /* non-blocking */
  }
}
