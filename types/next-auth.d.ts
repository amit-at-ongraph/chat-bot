import { UserRole } from "@/lib/constants";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      role?: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: UserRole;
  }
}
