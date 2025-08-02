import { logoIconWhite } from "@/assets";
import { Button } from "./ui/button";
import Link from "next/link";

export default function NavbarLanding() {
  return (
    <div className="min-h-screen bg-muted">
      <nav className="fixed top-6 inset-x-4 h-16 bg-background border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full">
        <div className="h-full flex items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2 md:gap-6">
            <img src={logoIconWhite.src} className="h-10 " />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                className="hidden sm:inline-flex rounded-full"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-full">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
