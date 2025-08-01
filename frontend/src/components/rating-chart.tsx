"use client";

import { Star, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RatingEntry } from "@/types/Ratings";
import { useEffect, useState } from "react";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type RatingChartProps = {
  ratings: RatingEntry[];
};

type chartType = {
  rating: string;
  count: number;
};

export function RatingChart({ ratings }: RatingChartProps) {
  const [chartData, setChartData] = useState<chartType[] | null>([]);

  const convertChartData = (ratings: RatingEntry[]) => {
    const counts: { [key: string]: number } = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };

    for (const r of ratings) {
      if (r.rating in counts) {
        counts[r.rating] += 1;
      }
    }

    return Object.keys(counts).map((rating) => ({
      rating,
      count: counts[rating],
    }));
  };

  useEffect(() => {
    const setRatingData = () => {
      if (ratings) {
        setChartData(convertChartData(ratings));
      }
    };
    setRatingData();
  }, [ratings]);

  
  if (!chartData) return <></>;

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardDescription>Rating Analysis</CardDescription>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rating"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `${value.slice(0, 3)}★`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
