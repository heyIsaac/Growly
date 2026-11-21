import { bindAuthUser, findUserByEmail } from "@/lib/db/queries/users";
import { auth } from "@/lib/auth/server";

export async function provisionBoundUser(params: {
  authUserId: string;
  email: string;
}) {
  const existing = await findUserByEmail(params.email);

  if (!existing) {
    await auth.signOut();
    return {
      ok: false as const,
      reason: "not_invited" as const,
    };
  }

  if (existing.status === "INACTIVE") {
    await auth.signOut();
    return {
      ok: false as const,
      reason: "inactive" as const,
    };
  }

  if (existing.authUserId && existing.authUserId !== params.authUserId) {
    await auth.signOut();
    return {
      ok: false as const,
      reason: "already_bound" as const,
    };
  }

  if (!existing.authUserId) {
    await bindAuthUser({
      userId: existing.id,
      companyId: existing.companyId,
      authUserId: params.authUserId,
    });
  }

  return { ok: true as const };
}
