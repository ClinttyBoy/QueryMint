"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { logoIconWhite } from "@/assets";
// import { Logowhite1 } from "@/assets";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSigning, setIsSigning] = useState(false);
  const [signInProvider, setSignInProvider] = useState<"google" | null>(null);

  const handleSignIn = async (provider: "google") => {
    try {
      setIsSigning(true);
      setSignInProvider(provider);
      await signIn(provider, {
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      console.error(`${provider} login failed:`, err);
    } finally {
      setIsSigning(false);
      setSignInProvider(null);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex items-center w-60 my-4 justify-center rounded-md">
                <img src={logoIconWhite.src} />
              </div>
              <span className="sr-only">QueryMint</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to QueryMint</h1>
          </div>
          <div className="">
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={() => handleSignIn("google")}
              disabled={isSigning}
            >
              {isSigning && signInProvider === "google" ? (
                <>
                  {/* <Spinner /> */}
                  Signing in...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
