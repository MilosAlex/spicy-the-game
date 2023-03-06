import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb";

export const authOptions = {
    secret: process.env.NEXT_PUBLIC_SECRET,
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Magic word (don't use passwords, I'm not encrypting)", type: "password", placeholder: "doggo" }
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied

                let user = null;
                try {
                    const client = await clientPromise;
                    const db = client.db("unodb");
                    const { username, password } = credentials;

                    const mongoUser = await db.collection("users").findOne({
                        username,
                        password,
                    });

                    if (mongoUser) {
                        user = { id: mongoUser._id.toString(), name: mongoUser.username }
                    }

                } catch (e) {
                    console.error(e);
                }

                //user = { id: "1", name: "J Smith", email: "jsmith@example.com" }

                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            },
        })
    ],
    callbacks: {
        async jwt({ token, account, profile, user }) {
            // Persist the OAuth access_token and or the user id to the token right after signin
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token and user id from a provider.
            session.accessToken = token.accessToken
            session.user.id = token.id

            return session
        }
    }

}

export default NextAuth(authOptions)