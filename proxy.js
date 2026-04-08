import { NextResponse } from "next/server";

export function proxy(req) {
  // Handle preflight (OPTIONS request)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const res = NextResponse.next();

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  return res;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const config = {
  matcher: "/api/:path*",
};
