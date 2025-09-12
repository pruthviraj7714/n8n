import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    token?: string; 
    username?:string;
    email?:string;
  }

  interface Session {
    user: {
      id: string;
      username: string,
      email : string
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    email?:string,
    username?: string
  }
}