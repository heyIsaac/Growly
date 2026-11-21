import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <Logo className="h-8" />
          <p className="mt-2 text-xs text-muted-foreground">Acesse sua conta</p>
        </div>
        {children}
      </div>
    </div>
  );
}
