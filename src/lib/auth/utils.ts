import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Checks if user has an active session and redirects if not
 * Use this for protected routes that require authentication
 */
export async function requireAuth({
  redirectTo = "/sign-in",
  returnUrl = "/",
}: {
  redirectTo?: string;
  returnUrl?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const redirectUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
    redirect(redirectUrl);
  }

  return session;
}

/**
 * Checks if user has an active session and redirects if they do
 * Use this for auth pages (sign-in, sign-up) that should only be accessible to unauthenticated users
 */
export async function requireNoAuth(redirectTo: string = "/") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(redirectTo);
  }

  return null;
}

/**
 * Gets the current session without any redirects
 * Use this when you need to check session status but handle it manually
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Helper function to get returnUrl from searchParams and redirect to it
 * Use this in auth pages after successful authentication
 */
export function getReturnUrl(searchParams: { returnUrl?: string }): string {
  return searchParams.returnUrl || "/";
}
