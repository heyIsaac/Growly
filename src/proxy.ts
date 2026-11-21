import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/sign-in" });

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/perfil",
    "/perfil/:path*",
    "/pessoas",
    "/pessoas/:path*",
    "/times",
    "/times/:path*",
    "/meu-time",
    "/meu-time/:path*",
    "/avaliacoes",
    "/avaliacoes/:path*",
    "/ciclos",
    "/ciclos/:path*",
    "/evolucao",
    "/evolucao/:path*",
    "/desenvolvimento",
    "/desenvolvimento/:path*",
    "/pdi",
    "/pdi/:path*",
    "/relatorios",
    "/relatorios/:path*",
    "/competencias",
    "/competencias/:path*",
    "/people",
    "/people/:path*",
  ],
};
