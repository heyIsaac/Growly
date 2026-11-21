"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VIEW_AS_COOKIE, getAuthenticatedUser } from "@/lib/auth/session";
import { findSessionUserById } from "@/lib/db/queries/users";

export async function setViewAs(formData: FormData) {
  const real = await getAuthenticatedUser();
  if (!real || real.role !== "ADMIN") {
    return;
  }

  const userId = String(formData.get("userId") ?? "");
  const target = await findSessionUserById(userId);
  if (!target || target.companyId !== real.companyId || target.status === "INACTIVE") {
    return;
  }

  const jar = await cookies();
  if (target.id === real.id) {
    jar.delete(VIEW_AS_COOKIE);
  } else {
    jar.set(VIEW_AS_COOKIE, target.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
