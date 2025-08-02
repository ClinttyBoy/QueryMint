"use client";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import NavbarLanding from "@/components/navbar-landing";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <NavbarLanding />
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
        )}
      />
      <div className="min-h-screen w-full flex flex-col gap-10 items-center justify-center px-6 py-12">
        <div className=" text-center max-w-3xl py-30">
          <Badge className=" from-primary via-muted/30 to-primary rounded-full py-1 border-none">
            QueryMint
          </Badge>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
            QueryMint: AI Powered Chat Support Service
          </h1>
          <p className="mt-6 text-[17px] md:text-lg">
            An AI-powered chat support platform that lets users embed smart bots
            into their websites, upload custom data, choose AI models, and pay
            per query using ETH
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full text-base">
                Get Started <ArrowUpRight className="!h-5 !w-5" />
              </Button>
            </Link>
            <Link href={"#"} target="_blank">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-base shadow-none"
              >
                <CirclePlay className="!h-5 !w-5" /> Watch Demo
              </Button>
            </Link>
          </div>
        </div>
        <div className="max-w-6xl my-6 text-center text-[17px] md:text-lg">
          lorem ipsum
        </div>
        {/* <div className="w-full max-w-screen-xl mx-auto aspect-video bg-accent rounded-xl overflow-hidden">
          <img src={ProjectFlow.src} />
        </div> */}
      </div>
    </div>
  );
}
