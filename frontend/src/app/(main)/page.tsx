"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { dashboardService, ChartDataPoint } from "@/services/api";

interface DashboardData {
  personal?: {
    myEmails: ChartDataPoint[];
    myStudentCards: ChartDataPoint[];
  };
}

const timeRanges = [
  { value: "all", label: "All Time" },
  { value: "1y", label: "Last Year" },
  { value: "90d", label: "Last 3 Months" },
  { value: "30d", label: "Last Month" },
  { value: "7d", label: "Last 7 Days" },
];

const chartConfig = {
  myEmails: {
    label: "My Emails Sent",
    color: "hsl(var(--chart-4))",
  },
  myStudentCards: {
    label: "My Student Cards",
    color: "hsl(var(--chart-5))",
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    personal: {
      myEmails: [],
      myStudentCards: [],
    },
  });
  const [timeRange, setTimeRange] = useState("7d");
  const [activeChart, setActiveChart] = useState<"myEmails" | "myStudentCards">("myEmails");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUsername(user.fullName || "");
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getUserDashboardData(timeRange);
        setData(dashboardData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(true);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, router]);

  // Calculate totals
  const totals = {
    myEmails: data.personal?.myEmails.reduce((acc, curr) => acc + Number(curr.count), 0) || 0,
    myStudentCards: data.personal?.myStudentCards.reduce((acc, curr) => acc + Number(curr.count), 0) || 0,
  };

  console.log("User totals:", totals);

  if (loading && !data.personal?.myEmails.length) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Error fetching data. Please try again later.</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {username ? `Welcome, ${username}` : 'Your Dashboard'}
      </h1>
      <div className="mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] rounded-lg">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value} className="rounded-lg">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `Your activity for ${timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()}`}
              </CardDescription>
            </div>
            <div className="flex">
              {["myEmails", "myStudentCards"].map((key) => {
                const chart = key as "myEmails" | "myStudentCards";
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:px-8 sm:py-6"
                    onClick={() => setActiveChart(chart)}
                    aria-label={`Show ${chartConfig[chart].label} chart`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {chartConfig[chart].label}
                    </span>
                    <span className="text-lg font-bold leading-none sm:text-3xl">
                      {loading ? "..." : totals[chart].toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              <BarChart
                accessibilityLayer
                data={data.personal?.[activeChart] || []}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="count"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Bar dataKey="count" fill={`var(--color-${activeChart})`} />
              </BarChart>
            </ChartContainer>
            {data.personal?.[activeChart]?.length === 0 && !loading && (
              <p className="text-center text-gray-500 mt-4">No data available for this time range</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}