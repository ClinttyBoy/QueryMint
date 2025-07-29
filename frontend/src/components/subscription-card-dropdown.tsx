"use client";

import { ChevronsUpDown, Copy, LogOut, Wallet } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shortenAddress } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUserData } from "@/contexts/UserContext";
import { TopupWalletDialog } from "./topup-wallet-dialog";
import NFtSubscriptionDialog from "./nft-subscription-dislog";

export function SubscriptionBtn() {
  const { address } = useUserData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"}>Top-Up / NFT</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem>
          <TopupWalletDialog />
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <NFtSubscriptionDialog />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
