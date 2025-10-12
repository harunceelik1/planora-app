// // middleware.ts
// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   (req) => {
//     const { nextUrl } = req;
//     const pathname = nextUrl.pathname;
//     const token = req.nextauth?.token;
//     console.log("TOKEN", token);  

//     const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
//     const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/settings");

//     if (isAuthPage && token) {
//       return NextResponse.redirect(new URL("/sign-up", nextUrl));
//     }
//     if (isProtected && !token) {
//       return NextResponse.redirect(new URL("/sign-up", nextUrl));
//     }
//     return NextResponse.next();
//   },
//   { callbacks: { authorized: () => true } }
// );

// export const config = {
//   matcher: ["/login", "/register", "/sign-in", "/sign-up", "/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
// };
