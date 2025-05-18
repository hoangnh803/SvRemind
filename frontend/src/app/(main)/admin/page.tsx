/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
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
import { dashboardService, ChartDataPoint } from "@/services/api";

interface DashboardData {
  system?: {
    users: ChartDataPoint[];
    emails: ChartDataPoint[];
    studentCards: ChartDataPoint[];
  };
  personal?: {
    myEmails: ChartDataPoint[];
    myStudentCards: ChartDataPoint[];
  };
}

const chartConfig: ChartConfig = {
  users: {
    label: "Total Users",
    color: "hsl(var(--chart-1))",
  },
  emails: {
    label: "Total Emails Sent",
    color: "hsl(var(--chart-2))",
  },
  studentCards: {
    label: "Total Student Cards",
    color: "hsl(var(--chart-3))",
  },
  myEmails: {
    label: "My Emails Sent",
    color: "hsl(var(--chart-4))",
  },
  myStudentCards: {
    label: "My Student Cards",
    color: "hsl(var(--chart-5))",
  },
};

const timeRanges = [
  { value: "all", label: "All Time" },
  { value: "1y", label: "Last Year" },
  { value: "90d", label: "Last 3 Months" },
  { value: "30d", label: "Last Month" },
  { value: "7d", label: "Last 7 Days" },
];

export default function AdminDashboard() {
  const [data, setData] = React.useState<DashboardData>({
    system: {
      users: [],
      emails: [],
      studentCards: [],
    },
    personal: {
      myEmails: [],
      myStudentCards: [],
    },
  });
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState<string>("90d");
  const [systemActiveChart, setSystemActiveChart] = React.useState<"users" | "emails" | "studentCards">("users");
  const [personalActiveChart, setPersonalActiveChart] = React.useState<"myEmails" | "myStudentCards">("myEmails");
  const [role, setRole] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setRole(user.role || null);
    }
  }, []);

  // Fetch dashboard data
  React.useEffect(() => {
    if (!role || role !== "Admin") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const newData = await dashboardService.getAdminDashboardData(timeRange);
        setData(newData);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
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
      system: {
        users: data.system.users.reduce((acc, curr) => acc + Number(curr.count), 0),
        emails: data.system.emails.reduce((acc, curr) => acc + Number(curr.count), 0),
        studentCards: data.system.studentCards.reduce((acc, curr) => acc + Number(curr.count), 0),
      },
      personal: {
        myEmails: data.personal.myEmails.reduce((acc, curr) => acc + Number(curr.count), 0),
        myStudentCards: data.personal.myStudentCards.reduce((acc, curr) => acc + Number(curr.count), 0),
      },
    }),
    [data]
  );

  console.log("Admin totals:", totals);

  if (role === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking permissions...</span>
      </div>
    );
  }

  if (role !== "Admin") {
    return null; // Redirect handled by useEffect
  }

  const systemCharts = ["users", "emails", "studentCards"];
  const personalCharts = ["myEmails", "myStudentCards"];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
        {/* System Metrics Card */}
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `System-wide data for ${timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()}`}
              </CardDescription>
            </div>
            <div className="flex">
              {systemCharts.map((key) => {
                const chart = key as "users" | "emails" | "studentCards";
                return (
                  <button
                    key={chart}
                    data-active={systemActiveChart === chart}
                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:px-8 sm:py-6"
                    onClick={() => setSystemActiveChart(chart)}
                    aria-label={`Show ${chartConfig[chart].label} chart`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {chartConfig[chart].label}
                    </span>
                    <span className="text-lg font-bold leading-none sm:text-3xl">
                      {loading ? "..." : totals.system[chart].toLocaleString()}
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
                data={data.system[systemActiveChart]}
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
                <Bar dataKey="count" fill={`var(--color-${systemActiveChart})`} />
              </BarChart>
            </ChartContainer>
            {data.system[systemActiveChart].length === 0 && !loading && (
              <p className="text-center text-gray-500 mt-4">No data available for this time range</p>
            )}
          </CardContent>
        </Card>

        {/* Personal Metrics Card */}
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Personal Metrics</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `Your activity for ${timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()}`}
              </CardDescription>
            </div>
            <div className="flex">
              {personalCharts.map((key) => {
                const chart = key as "myEmails" | "myStudentCards";
                return (
                  <button
                    key={chart}
                    data-active={personalActiveChart === chart}
                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:px-8 sm:py-6"
                    onClick={() => setPersonalActiveChart(chart)}
                    aria-label={`Show ${chartConfig[chart].label} chart`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {chartConfig[chart].label}
                    </span>
                    <span className="text-lg font-bold leading-none sm:text-3xl">
                      {loading ? "..." : totals.personal[chart].toLocaleString()}
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
                data={data.personal[personalActiveChart]}
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
                <Bar dataKey="count" fill={`var(--color-${personalActiveChart})`} />
              </BarChart>
            </ChartContainer>
            {data.personal[personalActiveChart].length === 0 && !loading && (
              <p className="text-center text-gray-500 mt-4">No data available for this time range</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}