import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "session";
const SESSION_TTL_S = 30 * 24 * 60 * 60;

/**
 * Comprobación optimista: si no hay cookie de sesión, redirige a /login sin tocar la BD.
 * La validación real se hace en el servidor (requireUser) cerca de los datos.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  // Renueva la caducidad de la cookie en navegaciones (sesión deslizante).
  if (request.method === "GET") {
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_S,
    });
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/applications/:path*"],
};
