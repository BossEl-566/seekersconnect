import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}