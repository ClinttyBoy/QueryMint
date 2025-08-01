import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { TopupWalletDialog } from "./topup-wallet-dialog";
import { UserBtn } from "./user-btn";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { logoIconWhite, NftIcon } from "@/assets";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { SubscriptionBtn } from "./subscription-card-dropdown";
import NFtSubscriptionDialog from "./nft-subscription-dislog";
import { useUserData } from "@/contexts/UserContext";
import { formatBalance, toDate } from "@/lib/utils";
import {
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "@/lib/constant";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { parseEther } from "viem";
import { PaymasterMode } from "@biconomy/account";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const Navbar = ({ menu = [{ title: "Home", url: "/" }] }: NavbarProps) => {
  const { data: session } = useSession();
  const { subscriptionExpiry, NFTSubscriptionStatus, smartAccount } =
    useUserData();

  const user = {
    name: session?.user?.name ?? "Anonymous",
    email: session?.user?.email ?? "no-email@example.com",
    image: session?.user?.image ?? "",
  };

  return (
    <section className="w-full px-6 py-4 mb-6 border dark:border-slate-700/70">
      <div className="w-full ">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            <Link href={"/dashboard"} className="flex items-center gap-2">
              <img
                src={logoIconWhite.src}
                className="max-h-10"
                alt={"QueryMint logo"}
              />
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuLink
                  href={"/dashboard"}
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
                >
                  Dashboard
                </NavigationMenuLink>
                <NavigationMenuLink
                  href={"/"}
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-4 justify-center items-center">
            {NFTSubscriptionStatus ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={NftIcon.src}
                    alt={"NFT icon"}
                    className="max-h-10 cursor-pointer hover:scale-105 "
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{`NFT Plan Active till ${toDate(
                    subscriptionExpiry ?? 0
                  )}`}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <NFtSubscriptionDialog />
            )}

            <TopupWalletDialog />

            <UserBtn user={user} />
          </div>
        </nav>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar };
