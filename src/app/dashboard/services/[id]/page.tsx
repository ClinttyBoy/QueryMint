"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserData } from "@/contexts/UserContext";
import { Service as ServiceType } from "@/types/Service";
import { BotIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RatingChart } from "@/components/rating-chart";
import { getInitials } from "@/lib/utils";

export default function Service() {
  const [service, setService] = useState<ServiceType | null>(null);
  const { fetchbyServiceId } = useUserData();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchbyServiceId(id as string);
      console.log(data.service);
      setService(data.service);
    };
    fetchData();
  }, [id]);

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted-foreground">
          Loading service details...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center ">
        <span>Service Details</span>{" "}
        <Button className="" size={"lg"}>
          <BotIcon size={48} /> Test Chatbot
        </Button>
      </div>
      <Card className="w-full">
        <CardHeader className="relative flex gap-6 ">
          <Avatar className="rounded-md w-40 h-40 ">
            <AvatarImage src={service.logo_url} />
            <AvatarFallback className="text-6xl">
              {getInitials(service.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-2 mt-2">
            <CardDescription className="text-md">
              project id : {service.id}
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {service.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className=" gap-10 text-sm">
          <div>
            <div className="w-24 text-muted-foreground  gap-2">Model</div>
            <div className=" flex gap-2 text-lg font-medium">
              {service.model}
            </div>
          </div>
          <div>
            <div className="w-24 text-muted-foreground gap-2">Data File</div>
            <div className="flex gap-2 text-lg font-medium">
              <Link
                href={service.data_url}
                target="_blank"
                className="flex justify-center items-center"
              >
                <Button variant={"link"} className="text-lg p-0 m-0">
                  File
                  <ExternalLink className="h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <div className="w-24 text-muted-foreground gap-2">Website</div>
            <div className="flex gap-2 text-lg font-medium">
              <Link
                href={service.website_url || "#"}
                target="_blank"
                className="flex justify-center items-center"
              >
                {service.website_url || "-"}
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="w-full flex flex-col justify-between">
          <CardHeader className="w-full flex flex-col gap-3">
            <CardDescription>Total customer interactions</CardDescription>
            <CardTitle className="text-4xl font-semibold tabular-nums @[250px]/card:text-3xl">
              85
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-3 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Number of times customers have interacted with your service.
            </div>
            <div className="text-muted-foreground">Based on 27 reviews</div>
          </CardFooter>
        </Card>
        <Card className="w-full flex flex-col justify-between">
          <CardHeader className="w-full flex flex-col gap-3">
            <CardDescription>Rating Overview</CardDescription>
            <CardTitle className="text-4xl font-semibold tabular-nums @[250px]/card:text-3xl">
              4.3<span className="text-base">/5</span>
            </CardTitle>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-3 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              This is the average rating given by customers for this service.
            </div>
            <div className="text-muted-foreground">Based on 27 reviews</div>
          </CardFooter>
        </Card>
        <RatingChart />
      </div>
    </div>
  );
}
