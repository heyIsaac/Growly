import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth/server";
import { provisionBoundUser } from "@/lib/auth/provision";
import {
  findSessionUserByAuthId,
  findSessionUserById,
  type SessionUser,
} from "@/lib/db/queries/users";
import type { UserRole } from "@/lib/authz/roles";

export const VIEW_AS_COOKIE = "growly-view-as";

export const getAuthenticatedUser = cache(async (): Promise<SessionUser | null> => {
  const { data: session } = await auth.getSession();
  const authUser = session?.user;
  if (!authUser?.id || !authUser.email) {
    return null;
  }

  const bound = await findSessionUserByAuthId(authUser.id);
  if (bound) {
    if (bound.status === "INACTIVE") {
      await auth.signOut();
      return null;
    }
    return bound;
  }

  const provisioned = await provisionBoundUser({
    authUserId: authUser.id,
    email: authUser.email,
  });

  if (!provisioned.ok) {
    return null;
  }

  return findSessionUserByAuthId(authUser.id);
});

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const real = await getAuthenticatedUser();
  if (!real || real.role !== "ADMIN") {
    return real;
  }

  const previewId = (await cookies()).get(VIEW_AS_COOKIE)?.value;
  if (!previewId || previewId === real.id) {
    return real;
  }

  const preview = await findSessionUserById(previewId);
  if (!preview || preview.companyId !== real.companyId || preview.status === "INACTIVE") {
    return real;
  }

  return preview;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}
