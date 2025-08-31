export { clerkMiddleware as default } from "@clerk/nextjs/server";

export const config = {
    matcher: [
        "/((?!.+\\.[\\w]+$|_next).*)",
        "/(api|trpc)(.*)",
    ],
};