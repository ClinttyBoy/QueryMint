"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserData } from "@/contexts/UserContext";
import { Service as ServiceType } from "@/types/Service";
import {
  BotIcon,
  Copy,
  ExternalLink,
  SquareArrowOutUpRightIcon,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RatingChart } from "@/components/rating-chart";
import {
  calculateAvgRating,
  fetchChatbyId,
  generateEmbedIframe,
  generateEmbedURL,
  getInitials,
} from "@/lib/utils";
import { RatingEntry } from "@/types/Ratings";
import { NftTextIcon } from "@/assets";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RATING_CONTRACT_ADDRESS } from "@/lib/constant";
import { DeleteServiceDialog } from "@/components/delete-service-dialog";

const rowsPerPage = 3;
export default function Service() {
  const { fetchbyServiceId, fetchRatings, userId } = useUserData();
  const [chatbotActive, setChatBotActive] = useState<Boolean>(false);
  const [service, setService] = useState<ServiceType | null>(null);
  const [ratings, setRatings] = useState<RatingEntry[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(rowsPerPage);
  const [chats, setChats] = useState<any[] | null>([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchbyServiceId(id as string);
      console.log(data.service);
      setService(data.service);
    };
    fetchData();
  }, [id, setChatBotActive]);

  useEffect(() => {
    const fetchRatingData = async () => {
      const serviceId = service?.id;
      if (serviceId) {
        const ratingData = await fetchRatings(serviceId);

        setRatings(ratingData);
        const chatData = await fetchChatbyId(serviceId);
        console.log(chatData);
        setChats(chatData);
      }
    };
    fetchRatingData();
  }, [service, setChatBotActive]);

  const memoizedAvgRating = useMemo(
    () => calculateAvgRating(ratings),
    [ratings, service]
  );
  const generataIframeCode = async () => {
    if (service) {
      const code = generateEmbedIframe(
        process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!,
        userId,
        service?.id,
        service?.data_url
      );
      await navigator.clipboard.writeText(code);
    }
  };

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
      {chatbotActive && (
        <>
          <span
            className="cursor-pointer"
            style={{
              position: "fixed",
              color: "black",
              bottom: "390px",
              right: "25px",
              border: "none",
              zIndex: 10000,
            }}
            onClick={() => setChatBotActive(false)}
          >
            <X />
          </span>
          <iframe
            src={generateEmbedURL(
              process.env.NEXT_PUBLIC_BACKEND_ENDPOINT ?? "",
              userId,
              service.id,
              service.data_url
            )}
            width="300"
            height="400"
            style={{
              position: "fixed",
              backgroundColor: "transparent",
              bottom: "20px",
              right: "20px",
              border: "none",
              zIndex: 9999,
            }}
          />
        </>
      )}
      <div className="flex justify-between items-center ">
        <span>Service Details</span>
        <div className="flex gap-3">
          {id && <DeleteServiceDialog id={id.toLocaleString()} />}
          <Button
            variant={"secondary"}
            size={"lg"}
            onClick={generataIframeCode}
          >
            <Copy size={48} /> Embbed Code
          </Button>
          <Button
            className=""
            size={"lg"}
            onClick={() => setChatBotActive(!chatbotActive)}
          >
            <BotIcon size={48} />{" "}
            {chatbotActive ? "Close ChatBot" : "Test Chatbot"}
          </Button>
        </div>
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
              service id : {service.id}
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
              {chats ? chats.length : 0}
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
              {memoizedAvgRating || 0}
              <span className="text-base">/5</span>
            </CardTitle>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-3 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              This is the average rating given by customers for this service.
            </div>
            <div className="text-muted-foreground">Based on 27 reviews</div>
          </CardFooter>
        </Card>
        <RatingChart ratings={ratings} />
      </div>
      <h2>Chat History</h2>
      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
        {chats && chats.length > 0
          ? chats
              // .slice(startIndex, endIndex)
              .map(({ id, txId, question, answer, rating, ratingToken }) => (
                <Card className="relative w-full gap-1 p-3" key={id}>
                  <CardHeader className="px-3">
                    <h3 className=" m-0 p-0">{question}</h3>
                    <CardAction className=" flex justify-center">
                      {txId ? (
                        <Button variant="ghost" className="w-10 h-10">
                          <Link
                            href={`https://explorer-holesky.morphl2.io/tx/${txId}`}
                            target="_blank"
                            className=""
                          >
                            <SquareArrowOutUpRightIcon />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant={"ghost"} className="w-10 p-0 h-10">
                          <img
                            src={NftTextIcon.src}
                            alt="NFT Text Icon"
                            className="h-4 w-4"
                          />
                        </Button>
                      )}
                      {rating && (
                        <Button
                          variant={"ghost"}
                          className="gap-1 p-0 w-10 h-10 m-0"
                        >
                          <Link
                            href={`https://explorer-holesky.morphl2.io/token/${RATING_CONTRACT_ADDRESS}/instance/${ratingToken}`}
                            target="_blank"
                            className="flex gap-1"
                          >
                            <span className="leading-4">{rating}</span> <Star />
                          </Link>
                        </Button>
                      )}
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="px-3">
                    <p className="text-muted-foreground text-sm m-0 p-0">
                      {answer}
                    </p>
                  </CardFooter>
                </Card>
              ))
          : "No Sessions"}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={
                startIndex === 0 ? "pointer-events-none opacity-50" : undefined
              }
              onClick={() => {
                setStartIndex(startIndex - rowsPerPage);
                setEndIndex(endIndex - rowsPerPage);
              }}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              className={
                endIndex === 100 ? "pointer-events-none opacity-50" : undefined
              }
              onClick={() => {
                setStartIndex(startIndex + rowsPerPage);
                setEndIndex(endIndex + rowsPerPage);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="my-1"></div>
    </div>
  );
}
