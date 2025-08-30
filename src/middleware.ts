export { clerkMiddleware as default } from "@clerk/nextjs/server";

export const config = {
    matcher: ["/", "/api/chat", "/api/chat/:path*"],
};