"use client";

import { Navbar } from "@/components/navbar";

import MetricsCard from "@/components/metrics-card";
import ProjectCards from "@/components/project-cards";

export default function Dashboard() {
  return (
    <>
      <MetricsCard />
      <ProjectCards />
    </>
  );
}
