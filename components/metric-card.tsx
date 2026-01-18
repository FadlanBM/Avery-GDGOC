import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  label: string
  value: string | number
  trend?: {
    direction: "up" | "down"
    value: string
  }
}

export function MetricCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
  trend,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {label}
            </p>
            <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
              {value}
            </p>
            {trend && (
              <p
                className={`text-sm mt-2 flex items-center gap-1 ${
                  trend.direction === "up"
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                <span>{trend.direction === "up" ? "↑" : "↓"}</span>
                <span>{trend.value}</span>
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
