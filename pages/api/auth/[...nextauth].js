import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb";
import comparePasswords from "../../../lib/comparePasswords";

// Specification for the authentication provider
export const authOptions = {
    secret: process.env.NEXT_PUBLIC_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "password", placeholder: "doggo" }
            },
            async authorize(credentials, req) {
                // Sign in logic
                let user = null;
                try {
                    const client = await clientPromise;
                    const db = client.db("spicydb");
                    const { username, password } = credentials;

                    const mongoUser = await db.collection("users").findOne({
                        username,
                    });

                    if (!mongoUser) {
                        return null;
                    }

                    const isPasswordMatch = await comparePasswords(password, mongoUser.password);

                    if (isPasswordMatch) {
                        user = { id: mongoUser._id.toString(), name: mongoUser.username }
                    }

                } catch (e) {
                    console.error(e);
                }

                if (user) {
                    return user;
                } else {
                    return null;
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, account, profile, user }) {
            // Persist the user id to the token right after signin
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token, user }) {
            // Send properties to the client
            session.accessToken = token.accessToken
            session.user.id = token.id

            return session
        }
    }
}

export default NextAuth(authOptions)