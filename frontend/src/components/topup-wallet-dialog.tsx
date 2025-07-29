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
import { Loader2Icon, LoaderCircle, Plus } from "lucide-react";
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
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { parseEther } from "viem";
import { base, morphHolesky } from "viem/chains";
import { toast } from "sonner";

interface PaymentProps {
  address: string;
  refreshBalance: () => Promise<void>;
}

function PaymentForm({ address, refreshBalance }: PaymentProps) {
  const { connect } = useConnect();

  const [value, setValue] = useState<string>("0.0001");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  async function handlePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFloatString(value)) return;
    if (!address) return;
    try {
      setIsProcessing(true);
      connect({ connector: injected() });
      const result = await sendTransaction(wagmiConfig, {
        to: address as `0x${string}`,
        value: parseEther(value),
      });
      console.log(result);
      const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: result,
      });

      console.log(approveReceipt);
      await refreshBalance();
      toast(
        `You have successfully added ${value} ETH to your QueryMint wallet.`
      );
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
      setValue("0.0001");
    }
  }

  return (
    <>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <Plus /> Topup Wallet
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
              <DialogTitle>Wallet Topped Up</DialogTitle>
              <DialogDescription>
                {`You have successfully added ${value} ETH to your QueryMint wallet.
                You are all set to handle new queries!`}
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Topup Wallet</DialogTitle>
                <DialogDescription>
                  Each query costs {process.env.NEXT_PUBLIC_QUERY_PRICE} ETH
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 py-4">
                <Label htmlFor="name-1">Amount</Label>
                <Input
                  id="name-1"
                  type="text"
                  name="name"
                  value={value}
                  disabled={isProcessing}
                  min={"0"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) {
                      setValue(val);
                    }
                  }}
                />
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
                Topup
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
}

export function TopupWalletDialog() {
  const { address, refreshBalance } = useUserData();
  return (
    <Dialog>
      {address && (
        <PaymentForm address={address} refreshBalance={refreshBalance} />
      )}
    </Dialog>
  );
}
