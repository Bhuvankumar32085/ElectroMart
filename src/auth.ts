import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "./model/user.model";
import connectDB from "./lib/connectDB";
import Google from "next-auth/providers/google";
// import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        try {
          const email = credentials?.email as string;
          const password = credentials?.password as string;
          const user = await User.findOne({ email });
          if (!user) return null;
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;
          return {
            id: user._id?.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error(error);
          throw new Error("Authorization failed");
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("signIn callback - account:", account);
      if (account?.provider == "google") {
        await connectDB();
        try {
          let DBuser = await User.findOne({ email: user?.email });
          if (!DBuser) {
            //create account
            DBuser = await User.create({
              name: user?.name,
              email: user?.email,
              image: user?.image,
            });
          }
          user.id = DBuser._id.toString();
          user.role = DBuser.role.toString();
        } catch (error) {
          console.error(error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
