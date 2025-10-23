import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface FeaturedSectionStatsProps {
  title?: string;
  subtitle?: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
  chartData?: Array<{
    name: string;
    value: number;
  }>;
}

export default function FeaturedSectionStats({
  title = "Powering teams with real-time insights.",
  subtitle = "Our next-gen analytics dashboard helps you track performance, manage clients, and make data-driven decisions in seconds.",
  stats = [
    { value: "50,000+", label: "Projects Managed" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "1,200+", label: "Enterprise Clients" },
    { value: "1.2s", label: "Avg. Response Time" },
  ],
  chartData = [
    { name: "Jan", value: 20 },
    { name: "Feb", value: 40 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 80 },
    { name: "May", value: 100 },
    { name: "Jun", value: 130 },
    { name: "Jul", value: 160 },
  ],
}: FeaturedSectionStatsProps) {
  return (
    <section className="w-full mx-auto text-left py-8">
      <div className="px-4">
        <h3 className="text-lg sm:text-xl lg:text-3xl font-medium text-foreground mb-8">
          {title}{" "}
          <span className="text-muted-foreground text-sm sm:text-base lg:text-2xl">
            {subtitle}
          </span>
        </h3>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-3xl font-medium text-foreground">{stat.value}</p>
              <p className="text-muted-foreground text-md">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full h-48 mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBlue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
