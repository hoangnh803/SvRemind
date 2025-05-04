/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
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

interface ChartDataPoint {
  date: string;
  count: number | string;
}

interface DashboardData {
  emails: ChartDataPoint[];
  studentCards: ChartDataPoint[];
}

const chartConfig: ChartConfig = {
  emails: {
    label: "Emails Sent",
    color: "hsl(var(--chart-2))",
  },
  studentCards: {
    label: "Student Cards",
    color: "hsl(var(--chart-3))",
  },
};

const timeRanges = [
  { value: "all", label: "All Time" },
  { value: "1y", label: "Last Year" },
  { value: "90d", label: "Last 3 Months" },
  { value: "30d", label: "Last Month" },
  { value: "7d", label: "Last 7 Days" },
];

export default function UserDashboard() {
  const [data, setData] = React.useState<DashboardData>({
    emails: [],
    studentCards: [],
  });
  const [timeRange, setTimeRange] = React.useState<string>("90d");
  const [activeChart, setActiveChart] = React.useState<"emails" | "studentCards">("emails");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [role, setRole] = React.useState<string | null>(null);
  const router = useRouter();

  // Check user role from localStorage
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.role) {
      router.push("/login");
    } else if (user.role === "Admin") {
      router.push("/admin");
    } else {
      setRole(user.role);
    }
  }, [router]);

  // Fetch dashboard data
  React.useEffect(() => {
    if (!role || role === "Admin") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const headers = { Authorization: `Bearer ${token}` };

        const processData = (rawData: any[]): ChartDataPoint[] =>
          rawData.map((item) => ({
            date: item.date,
            count: Number(item.count),
          })).filter((item) => !isNaN(item.count));

        const [emailsResponse, studentCardsResponse] = await Promise.all([
          axios.get<ChartDataPoint[]>("http://localhost:3001/dashboard/user/emails", { headers, params: { timeRange } }),
          axios.get<ChartDataPoint[]>("http://localhost:3001/dashboard/user/student-cards", { headers, params: { timeRange } }),
        ]);

        const newData = {
          emails: processData(emailsResponse.data),
          studentCards: processData(studentCardsResponse.data),
        };

        console.log("Processed user dashboard data:", newData);
        setData(newData);
      } catch (error) {
        console.error("Error fetching user dashboard data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, role, router]);

  // Calculate totals
  const totals = React.useMemo(
    () => ({
      emails: data.emails.reduce((acc, curr) => acc + Number(curr.count), 0),
      studentCards: data.studentCards.reduce((acc, curr) => acc + Number(curr.count), 0),
    }),
    [data]
  );

  console.log("User totals:", totals);

  if (role === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking permissions...</span>
      </div>
    );
  }

  if (role === "Admin") {
    return null; // Redirect handled by useEffect
  }

  const availableCharts = ["emails", "studentCards"];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
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
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Your Metrics</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `Showing data for ${timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()}`}
            </CardDescription>
          </div>
          <div className="flex">
            {availableCharts.map((key) => {
              const chart = key as "emails" | "studentCards";
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
              data={data[activeChart]}
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
          {data[activeChart].length === 0 && !loading && (
            <p className="text-center text-gray-500 mt-4">No data available for this time range</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}