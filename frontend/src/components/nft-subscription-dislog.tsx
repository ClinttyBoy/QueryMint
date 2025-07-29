import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, Loader2Icon, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import {
  injected,
  useAccount,
  useConnect,
  useSendTransaction,
  useSignTypedData,
} from "wagmi";
import { isFloatString } from "@/lib/utils";
import { useUserData } from "@/contexts/UserContext";
import {
  sendTransaction,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { toast } from "sonner";
import { NftTextIcon } from "@/assets";
import {
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "@/lib/constant";
import { parseEther } from "viem";

interface PaymentProps {
  address: string;
  refreshNFTSubscriptionStatus: () => Promise<void>;
}

function PaymentForm({ address, refreshNFTSubscriptionStatus }: PaymentProps) {
  const { connect } = useConnect();

  const [value, setValue] = useState<string>("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  async function handlePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFloatString(value)) return;
    if (!address) return;

    try {
      setIsProcessing(true);
      connect({ connector: injected() });
      const { request } = await simulateContract(wagmiConfig, {
        abi: SUBSCRIPTION_CONTRACT_ABI,
        address: SUBSCRIPTION_CONTRACT_ADDRESS,
        functionName: "subscribe",
        args: [address, Number(value)],
        value: parseEther(
          (
            Number(value) *
            (Number(process.env.NEXT_PUBLIC_MONTH_PRICE) || 0.0002)
          ).toString()
        ),
      });

      const approveResult = await writeContract(wagmiConfig, request);
      console.log(approveResult);

      const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: approveResult,
      });
      console.log(approveReceipt);
      await refreshNFTSubscriptionStatus();
      setSuccess(true);
      toast(
        `You’ve successfully subscribed for ${value} month${
          Number(value) > 1 ? "s" : ""
        }`
      );
    } catch (e) {
      console.log(e);
    } finally {
      setIsProcessing(false);
      setValue("1");
    }
  }

  return (
    <>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <img src={NftTextIcon.src} alt="NFT Text Icon" className="h-4 w-4" />
          NFT Plan
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        showCloseButton={false}
        preventOutsideClose={true}
      >
        <form onSubmit={handlePayment}>
          {isSuccess ? (
            <DialogHeader className="my-4">
              <DialogTitle>Subscription NFT Purchased</DialogTitle>
              <DialogDescription>
                `✅ Successfully subscribed! Your NFT is active until $
                {new Date(
                  new Date(
                    new Date().setMonth(new Date().getMonth() + Number(value))
                  )
                ).toLocaleDateString()}
                .`
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Buy Subscription NFT</DialogTitle>
                <DialogDescription>{`Each month costs ${process.env.NEXT_PUBLIC_MONTH_PRICE} ETH`}</DialogDescription>
              </DialogHeader>
              <div>
                <div className="grid gap-3 py-4">
                  <Label htmlFor="name-1">Months</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="name-1"
                      type="number"
                      name="name"
                      value={value}
                      disabled={isProcessing}
                      min={"0"}
                      className=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val)) {
                          setValue(val);
                        }
                      }}
                    />
                    <ArrowLeftRight size={40} />
                    <Input
                      id="name-1"
                      type="text"
                      name="name"
                      value={`${
                        Number(value) *
                        (Number(process.env.NEXT_PUBLIC_MONTH_PRICE) || 0.0002)
                      } ETH`}
                      disabled={isProcessing}
                      min={"0"}
                      // disabled={true}
                    />
                  </div>
                </div>
                <div className="text-muted-foreground text-sm mb-3">
                  Your NFT subscription will expire after the selected period.
                  To continue access, you’ll need to renew it.
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isProcessing}
                onClick={() => {
                  setSuccess(false);
                }}
              >
                Close
              </Button>
            </DialogClose>
            {!isSuccess && (
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <LoaderCircle className="animate-spin" />}{" "}
                Subscribe
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
}

export default function NFtSubscriptionDialog() {
  const { address, refreshNFTSubscriptionStatus } = useUserData();
  return (
    <Dialog>
      {address && (
        <PaymentForm
          address={address}
          refreshNFTSubscriptionStatus={refreshNFTSubscriptionStatus}
          //   subscribeNFTFunc={subscribeNFTFunc}
        />
      )}
    </Dialog>
  );
}
