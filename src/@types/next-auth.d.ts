import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        createdAt?: Date | string
    }

    interface Session {
        user: {
            createdAt?: Date | string
        } & DefaultSession["user"]
    }
}