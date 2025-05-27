import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: "up" | "down"
}

export function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-purple-100">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">{change} from last month</span>
              <span className="sm:hidden">{change}</span>
            </p>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
