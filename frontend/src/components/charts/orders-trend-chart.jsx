

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { day: "Mon", orders: 45 },
  { day: "Tue", orders: 52 },
  { day: "Wed", orders: 38 },
  { day: "Thu", orders: 61 },
  { day: "Fri", orders: 73 },
  { day: "Sat", orders: 89 },
  { day: "Sun", orders: 67 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#9333ea",
  },
}

export function OrdersTrendChart() {
  return (
    <div className="h-[200px] sm:h-[250px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#9333ea"
              strokeWidth={3}
              dot={{ fill: "#9333ea", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#9333ea", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
