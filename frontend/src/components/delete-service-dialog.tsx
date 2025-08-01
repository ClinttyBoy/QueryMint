"use client";
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
import { Button } from "@/components/ui/button";

import { Copy, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useUserData } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

function ServiceForm({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { fetchServices } = useUserData();
  const [isSuccess, setSuccess] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/delete-service", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      console.log(res);
      await fetchServices();
      toast(
        "The service has been deleted. You can no longer access this chatbot."
      );
      setSuccess(true);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DialogTrigger asChild>
        <Button variant={"destructive"} size={"lg"}>
          <Trash2 /> Delete
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[400px]"
        showCloseButton={!isSuccess}
        preventOutsideClose={true}
      >
        {isLoading && (
          <div className="absolute flex justify-center items-center w-full h-full bg-[#03071291]">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
        {isSuccess ? (
          <DialogHeader className="my-4">
            <DialogTitle>Deleted Chatbot Support Service</DialogTitle>
            <DialogDescription>Service deleted successfully!</DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader className="my-4">
            <DialogTitle>Delete Chatbot Support Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service?
            </DialogDescription>
          </DialogHeader>
        )}
        <DialogFooter>
          {isSuccess ? (
            <DialogClose asChild>
              <Button onClick={() => router.push("/dashboard")}>Home</Button>
            </DialogClose>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading && <LoaderCircle className="animate-spin" />} Delete
              </Button>
              <DialogClose asChild>
                <Button disabled={isLoading}>Cancel</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </>
  );
}

export function DeleteServiceDialog({ id }: { id: string }) {
  return (
    <Dialog>
      <ServiceForm id={id} />
    </Dialog>
  );
}
