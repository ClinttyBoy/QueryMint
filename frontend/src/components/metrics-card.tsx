import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useUserData } from "@/contexts/UserContext";
import { balanceToQueries, shortenAddress, toDate } from "@/lib/utils";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";

export default function MetricsCard() {
  const {
    address,
    balance,
    subscriptionExpiry,
    NFTSubscriptionStatus,
    interactionCount,
  } = useUserData();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardDescription>Balance in Smart Account (ETH)</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {balance ? balance : "0"} ETH
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Wallet Address
          </div>
          <div className="text-muted-foreground flex justify-center items-center gap-2">
            <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              {shortenAddress(address, 6, 6)}
            </code>
            <Button
              variant="secondary"
              className="size-7 cursor-pointer"
              onClick={async () => await navigator.clipboard.writeText(address)}
            >
              <Copy className="h-[14px]" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      {NFTSubscriptionStatus ? (
        <Card className="w-full">
          <CardHeader>
            <CardDescription>Active NFT Plan till</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {subscriptionExpiry && toDate(subscriptionExpiry).toDateString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Active monthly NFT subscription. Costs 0.0002 ETH/month
            </div>
            <div className="text-muted-foreground"></div>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardDescription>Remaining Queries</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {balanceToQueries(balance)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Each query costs 0.0002ETH. Top up to stay active.
            </div>
            <div className="text-muted-foreground"></div>
          </CardFooter>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardDescription> Total Interactions</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {interactionCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total number of interactions your AI support has handled.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
