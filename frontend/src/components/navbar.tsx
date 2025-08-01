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

const Navbar = ({
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Products",
      url: "#",
    },
    {
      title: "Resources",
      url: "#",
    },
  ],
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
}: NavbarProps) => {
  const { data: session } = useSession();
  const { subscriptionExpiry, NFTSubscriptionStatus, smartAccount } =
    useUserData();

  const user = {
    name: session?.user?.name ?? "Anonymous",
    email: session?.user?.email ?? "no-email@example.com",
    image: session?.user?.image ?? "",
  };

  const handleTemp = async () => {
    if (!smartAccount) return;

    const getBalance = await smartAccount.getBalances();
    const balance = formatBalance(getBalance[0].amount, getBalance[0].decimals);
    console.log("balance", balance);
    if (Number(balance) < 0.0002) {
      return false;
    }
    try {
      const tx = await smartAccount.sendTransaction(
        {
          to: "0x77B708A7102A2e905a056BFC34d82631138918CC",
          value: parseEther("0.0002"),
        },
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      );
      const { transactionHash } = await tx.waitForTxHash();
      console.log("Transaction Hash", transactionHash);

      const userOpReceipt = await tx.wait();
      console.log("Transaction Receipt", userOpReceipt);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Transaction Error:", error);
      }
    }
  };

  // console.log(`${Date.now()}-${Math.floor(Math.random() * 1000)}`);
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
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
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
            <Button variant="outline" size="icon" onClick={handleTemp}>
              temp
            </Button>
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

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
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
