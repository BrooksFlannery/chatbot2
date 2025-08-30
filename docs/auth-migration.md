## Auth Migration Guide: BetterAuth ➜ Clerk (recommended) or NextAuth.js

This guide is tailored to this repository (Next.js App Router, Drizzle) and shows how to completely remove BetterAuth and migrate to either Clerk or NextAuth.js. Clerk is the fastest way to restore email/password and social auth with minimal backend work; NextAuth.js is provided as an alternative.

---

### 0) Inventory: Where BetterAuth is used now

- `src/lib/auth.ts` — BetterAuth server config
- `src/lib/auth-client.ts` — BetterAuth client
- `src/app/api/auth/[...all]/route.ts` — BetterAuth handler
- `src/middleware.ts` — route protection via `getSessionCookie`
- `src/server/server.ts` — server actions for sign-in/sign-up via BetterAuth
- API routes that read the session:
  - `src/app/api/chat/route.ts`
  - `src/app/api/chat/[id]/route.ts`
  - `src/app/api/chat/[id]/messages/route.ts`
  - `src/app/api/chat/[id]/messages/ai/route.ts`
- UI using auth:
  - `src/components/login-form.tsx`, `src/components/signup-form.tsx`, `src/components/logout.tsx`
  - `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Database tables created for BetterAuth (Drizzle): `user`, `session`, `account`, `verification` in `src/db/schema.ts` (and migrations under `migrations/`).

---

### 1) Plan

1. Remove BetterAuth code and dependency entirely.
2. Choose target:
   - Option A: Clerk (recommended for fastest parity with email/password + social)
   - Option B: NextAuth.js v5 (JWT sessions; optional Google, GitHub, etc.)
3. Update API routes to use the new session API.
4. Replace middleware-based protection.
5. Replace login/signup/logout UI.
6. Update DB schema: remove BetterAuth tables. If using Clerk or JWT-only NextAuth, drop the FK on `chat.userId` and keep it as plain `text`.

---

### 2) Rip out BetterAuth

Run:

```bash
npm remove better-auth
```

Delete files:

- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/server/server.ts` (we will replace sign-in/up flow per chosen provider)

Replace `src/middleware.ts` entirely (we’ll provide new middleware in each option).

Database cleanup (Drizzle):

- Remove `user`, `session`, `account`, `verification` tables from `src/db/schema.ts`.
- Remove FK on `chat.userId` (keep `chat.userId` as `text` without references). Example change in `schema.ts`:

```ts
// Before
export const chat = pgTable("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  chatName: varchar("chatName", { length: 256 }).default("New Chat"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

// After (drop FK, keep text userId)
export const chat = pgTable("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull(),
  chatName: varchar("chatName", { length: 256 }).default("New Chat"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});
```

Generate and run a migration that drops the four auth tables and the FK on `chat.userId`.

---

## Option A: Clerk (recommended)

Clerk provides managed auth (email/password, social, MFA), UI components, server helpers, and middleware.

1) Install and configure

```bash
npm install @clerk/nextjs
```

Add environment variables (dev values from Clerk Dashboard):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
```

If using `src/env.js` validation, add these keys accordingly.

2) Provider in App Router layout

Wrap the app in `ClerkProvider` in `src/app/layout.tsx`:

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

3) Middleware protection

Replace `src/middleware.ts` with Clerk middleware and reuse existing matchers:

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/", "/api/chat", "/api/chat/:path*"],
};
```

4) Replace UI for sign-in/up and sign-out

- `src/app/login/page.tsx` ➜ redirect or render Clerk’s `<SignIn />`
- `src/app/signup/page.tsx` ➜ redirect or render Clerk’s `<SignUp />`
- Replace `src/components/logout.tsx` with Clerk’s `<UserButton />` or a button calling `signOut()`.

Minimal pages:

```tsx
// src/app/sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function Page() { return <SignIn />; }

// src/app/sign-up/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function Page() { return <SignUp />; }
```

If you want to keep your custom forms, you can use Clerk’s APIs to perform email/password sign-in and sign-up, but using Clerk’s prebuilt components is fastest.

5) Update API routes to read the session

Replace BetterAuth session checks with Clerk’s server helper:

```ts
// Example: src/app/api/chat/route.ts
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  // Use userId (string) with chat.userId
}
```

Do the same in:

- `src/app/api/chat/[id]/route.ts`
- `src/app/api/chat/[id]/messages/route.ts`
- `src/app/api/chat/[id]/messages/ai/route.ts`

6) Remove obsolete files

- Delete `src/components/login-form.tsx`, `src/components/signup-form.tsx` if migrating fully to Clerk UI.
- Remove any imports of BetterAuth helpers from components and routes.

7) Verify

- `npm run dev`
- Sign up and sign in via Clerk
- Ensure chats filter by `userId` from Clerk’s session

---

## Option B: NextAuth.js (Auth.js v5, App Router, JWT sessions)

This avoids database tables by using JWT sessions. If you want database-backed sessions and accounts, use `@auth/drizzle-adapter` and add the adapter schema; that requires different tables than the existing BetterAuth ones.

1) Install

```bash
npm install next-auth
```

Add env vars for providers you use (e.g., Google):

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_strong_secret
```

2) Create `src/auth.ts` with v5 exports

```ts
// src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Ensure token.sub becomes our userId equivalent
      return token;
    },
    async session({ session, token }) {
      // Expose a stable user id on session for server usage
      if (token?.sub) {
        // @ts-expect-error add id field
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
```

3) API route handler

```ts
// src/app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@/auth";
```

4) Middleware protection

```ts
// src/middleware.ts
export { auth as middleware } from "@/auth";
export const config = { matcher: ["/", "/api/chat", "/api/chat/:path*"] };
```

5) Session usage in API routes

Replace BetterAuth checks with `auth()`:

```ts
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  // proceed using userId as chat.userId
}
```

Update in:

- `src/app/api/chat/route.ts`
- `src/app/api/chat/[id]/route.ts`
- `src/app/api/chat/[id]/messages/route.ts`
- `src/app/api/chat/[id]/messages/ai/route.ts`

6) Client provider (if you use `useSession` on client)

Wrap the app with `SessionProvider` or provide it per page where needed:

```tsx
// Example usage in a client layout or provider
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

7) UI for sign-in/up/sign-out

- For social sign-in, render a button that calls `signIn("google")`.
- If you need username/password, implement a Credentials provider and your own password storage (out of scope for the simplest path).
- Replace `src/components/logout.tsx` to call `signOut()`.

8) Database note

With JWT sessions, no auth tables are required. Keep `chat.userId` as `text` without FK (as in Section 2). If you later adopt the Drizzle adapter, add its schema (tables `users`, `accounts`, `sessions`, `verificationTokens`) and update `chat.userId` to reference `users.id`.

---

### 3) Post-migration checklist

- Remove any lingering `better-auth` imports/usages
- Ensure middleware protects the same routes as before
- All auth-required API routes return 401 for unauthenticated requests
- Chat creation and queries use the new `userId` consistently
- Update `.env.local` and production secrets

---

### 4) Quick mapping (old ➜ new)

- BetterAuth `auth.api.getSession({ headers })` ➜ Clerk `auth()` or NextAuth `auth()`
- BetterAuth middleware (`getSessionCookie`) ➜ Clerk `clerkMiddleware()` or NextAuth `auth as middleware`
- BetterAuth login/signup forms ➜ Clerk `<SignIn/> / <SignUp/>` or NextAuth `signIn()` calls
- DB `user/session/account/verification` ➜ remove (Clerk/NextAuth JWT) or replace with Auth.js adapter tables

---

### 5) Rollback strategy

All changes are additive/removals. Keep a branch with BetterAuth intact. If issues arise, revert DB migrations that dropped auth tables and restore the deleted files.


