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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2Icon, LoaderCircle, Plus } from "lucide-react";
import { v4 as uuid } from "uuid";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useUserData } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import { toast } from "sonner";
import {
  cn,
  createJsonFileFromDocs,
  generateEmbedIframe,
  loadAndSplitTextFromBlob,
} from "@/lib/utils";
import { Service } from "@/types/Service";
import { Card } from "./ui/card";

const dummyModelData = [
  {
    id: "model-2",
    name: "Gemini 2.5 ",
    provider: "Google",
    description: "Google's latest model",
    badge: "new",
  },
  {
    id: "model-10",
    name: "Titan Text G1",
    provider: "Amazon",
    description: "Amazon's native Bedrock-hosted model",
  },
  {
    id: "model-3",
    name: "Grok 3 Beta",
    provider: "xAI",
    description: "xAI's latest model",
  },

  {
    id: "model-5",
    name: "GPT-o3",
    provider: "OpenAI",
    description: "OpenAI’s most powerful reasoning model",
    selected: true,
  },

  {
    id: "model-7",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Anthropic’s most capable model with long context",
  },

  {
    id: "model-9",
    name: "LLaMA 3 70B",
    provider: "Meta",
    description: "Meta’s open-weight high-performance model",
  },
];

const formSchema = z.object({
  serviceName: z.string(), // service name
  logoImage: z.any(), // logo file
  model: z.string(), // selected model
  file: z.any(), // document file
  website: z.string().optional(), // website link
});

function ServiceForm({ open }: { open: boolean }) {
  //   const router = useRouter();
  const [embedCode, setEmbedCode] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const { userId } = useUserData();
  const [isSuccess, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website: "--",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // console.log(values);
    try {
      const data = await loadAndSplitTextFromBlob(values.file);
      const file = createJsonFileFromDocs(data);
      const fileForm = new FormData();
      const service_id = uuid();

      //File Upload
      fileForm.set("file", file);
      fileForm.set("service_id", service_id);
      const fileUploadRes = await fetch("/api/upload-file", {
        method: "POST",
        body: fileForm,
      });
      const data_url = await fileUploadRes.json();
      console.log(data_url);

      // Logo Upload
      const logoForm = new FormData();
      logoForm.set("file", values.logoImage);
      logoForm.set("service_id", service_id);
      const logoUploadRes = await fetch("/api/upload-file", {
        method: "POST",
        body: logoForm,
      });
      const logo_url = await logoUploadRes.json();

      // Embedded URL
      const embedded_url = generateEmbedIframe(
        process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!,
        userId,
        service_id,
        data_url
      );
      setEmbedCode(embedded_url);

      const payload: Service = {
        user_id: userId,
        name: values.serviceName,
        model: values.model,
        website_url: values.website,
        id: service_id,
        data_url,
        logo_url,
        embedded_url,
      };

      try {
        const res = await fetch("/api/add-service", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log(res);
        // setOpen(true);
        toast(
          `Service created successfully!\n\nYou can now use your chatbot service.`
        );
        setSuccess(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  useEffect(() => {
    const resetState = () => {
      form.reset();
      setSuccess(false);
      setLoading(false);
      setEmbedCode("");
    };
    resetState();
  }, [open]);
  return (
    <>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <Plus /> Create
        </Button>
      </DialogTrigger>
      {isSuccess ? (
        <DialogContent>
          <DialogHeader className="my-4">
            <DialogTitle>Service Created Successfully</DialogTitle>
            <DialogDescription>
              Copy this link and paste in your website site
            </DialogDescription>
          </DialogHeader>
          <div className="relative grid gap-4">
            <span className="absolute bottom-3 right-3">
              <Button
                variant="secondary"
                className="size-7 cursor-pointer"
                onClick={async () =>
                  await navigator.clipboard.writeText(embedCode)
                }
              >
                <Copy className="h-[14px]" />
              </Button>
            </span>
            <Card
              className={cn(
                "p-3 pb-7 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex  w-full rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              )}
            >
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            </Card>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent
          className="sm:max-w-[600px]"
          showCloseButton={!isLoading}
          preventOutsideClose={true}
        >
          {isLoading && (
            <div className="absolute flex justify-center items-center w-full h-full bg-[#03071291]">
              <LoaderCircle className="animate-spin" />
            </div>
          )}
          <DialogHeader className="my-4">
            <DialogTitle>Create Chatbot Support Service</DialogTitle>
            <DialogDescription>
              Fill all fields to create your chatbot service
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="serviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Service name..."
                        type="text"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo File Upload */}
              <FormField
                control={form.control}
                name="logoImage"
                render={({ field: { onChange, ref } }) => (
                  <FormItem className="w-50">
                    <FormLabel>Logo Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        ref={ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Select Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dummyModelData.map(({ id, name }) => (
                          <SelectItem value={name} key={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Upload */}
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, ref } }) => (
                  <FormItem className="w-50">
                    <FormLabel>Upload Document</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".txt"
                        required
                        onChange={(e) => onChange(e.target.files?.[0])}
                        ref={ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website Link */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </>
  );
}

export function CreateServiceDialog() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog onClose={() => setOpen(!open)}>
      <ServiceForm open={open} />
    </Dialog>
  );
}
