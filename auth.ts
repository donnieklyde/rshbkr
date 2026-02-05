import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                // Fetch the latest user data to check for isOnboarded status
                // The adapter usually handles this, but 'user' object in session callback 
                // might come from the token or database depending on strategy.
                // With "database" strategy (default with adapter), 'user' is the database user.
                session.user.id = user.id;

                // We need to extend the session type to include isOnboarded if we want it client side
                // For now, we'll fetch it if needed or trust the adapter's user object if typed correctly.
                // Let's assume we can access it via prisma if needed or add it to types later.
                const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
                (session.user as any).isOnboarded = dbUser?.isOnboarded;
                (session.user as any).username = dbUser?.username;
            }
            return session
        },
    },
})
