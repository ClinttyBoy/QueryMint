"use client";

import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import React, { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="px-6 max-w-5xl mx-auto space-y-8">{children}</div>
      {/* <Footer /> */}
    </>
  );
}
