"use client";
import {
  LayoutGrid,
  List,
  Link as LinkIcon,
  CardSim,
  CodeXml,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
  CardAction,
} from "./ui/card";
import { Button } from "./ui/button";
import { CreateServiceDialog } from "./create-service-dialog";
import { getInitials } from "@/lib/utils";
import { useUserData } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function ProjectCards() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const router = useRouter();
  const { services } = useUserData();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Services</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </Button>
          <CreateServiceDialog />
        </div>
      </div>
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map(
            ({ name, id, data_url, logo_url, website_url, model }) => (
              <Card
                key={id}
                onClick={() => {
                  router.push(`/dashboard/services/${id}`);
                }}
                className="relative cursor-pointer overflow-hidden group shadow-lg border gap-3 pb-2 hover:border-slate-600"
              >
                <div className={`absolute left-0 top-0 h-full w-2`} />
                <CardHeader className="flex items-center gap-2 ">
                  {logo_url ? (
                    <img
                      src={logo_url}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="bg-slate-200 text-black flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                      {getInitials(name)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {name}
                    </CardTitle>
                    <CardDescription className=" mt-1">{model}</CardDescription>

                    <div className="text-xs text-muted-foreground mt-1"></div>
                  </div>{" "}
                  <CardAction className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon">
                      <LinkIcon />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <CardSim />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <CodeXml />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex p-0 m-2">
                  {website_url && (
                    <Button
                      variant="link"
                      className="inline-block"
                      //   href={website_url}
                    >
                      {website_url}
                    </Button>
                  )}
                </CardContent>
                {/* <CardFooter className="flex justify-end px-6"></CardFooter> */}
              </Card>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {services.map(
            ({ name, id, data_url, logo_url, website_url, model }) => (
              <Card
                key={id}
                onClick={() => {
                  router.push(`/dashboard/services/${id}`);
                }}
                className="flex flex-row items-center gap-4 shadow-md border group cursor-pointer hover:border-slate-600"
              >
                <CardHeader className="relative w-full flex flex-row items-center gap-4">
                  {logo_url ? (
                    <img
                      src={logo_url}
                      alt={name}
                      className="w-14 h-14 rounded-full object-cover border ml-4"
                    />
                  ) : (
                    <div className="bg-slate-200 text-black flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                      {getInitials(name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">
                      {name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {model}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 truncate">
                      {website_url && (
                        <Button
                          variant="link"
                          className="inline-block p-0 m-0 h-5"
                        >
                          {website_url}
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardAction className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon">
                      <LinkIcon />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <CardSim />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <CodeXml />
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            )
          )}
        </div>
      )}
    </section>
  );
}
