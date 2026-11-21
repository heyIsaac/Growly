import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function OrcamentoLayout({ children }: LayoutProps<"/orcamento">) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="Growly">
          <Logo className="h-9" />
        </Link>
        <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
          Já tenho conta
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16">{children}</main>
    </div>
  );
}
