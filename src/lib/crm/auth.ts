import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/crm/db";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[crm] AUTH_SECRET is not set. CRM login is disabled.");
  }
  return secret || "dev-only-crm-secret-change-me";
}

function secretsConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.NODE_ENV !== "production");
}

export function signBridgeToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 60_000 })).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyBridgeToken(token: string): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId?: string; exp?: number };
    if (!parsed.userId || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed.userId;
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret(),
  basePath: "/api/crm-auth",
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/crm/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        bridgeToken: { label: "Bridge", type: "text" },
      },
      authorize: async (credentials) => {
        if (!secretsConfigured()) return null;
        const bridgeToken = String(credentials?.bridgeToken ?? "");
        if (bridgeToken) {
          const userId = verifyBridgeToken(bridgeToken);
          if (!userId) return null;
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user?.active) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }

        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.active) return null;
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "");
      }
      return session;
    },
  },
});

export async function requireCrmUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user?.active) return null;
  return user;
}

export async function requireCrmAdmin() {
  const user = await requireCrmUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
