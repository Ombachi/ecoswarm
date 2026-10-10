import { ReactNode } from "react";
import { PublicNav } from "./PublicNav";
import { PublicFooter } from "./PublicFooter";
export function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden"><PublicNav /><main className="pt-16">{children}</main><PublicFooter /></div>;
}
