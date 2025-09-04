// middleware.js
import { NextRequest, NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname); // Set a custom header
  return response;
};

export const config = {
  matcher: "/:path*", // Apply middleware to all paths
};
