"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect } from "react";

const AuthProviderFn = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" && pathname !== "/") {
      console.log("please login!");
      router.push(`/login?callbackUrl=${pathname}`);
    }
  }, [status, pathname, router]);
};

type AuthContextProps = ReturnType<typeof AuthProviderFn>;

const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={AuthProviderFn()}>
      {children}
    </AuthContext.Provider>
  );
};
