import { Badge } from "@/components/ui/badge"

interface OrderCardProps {
  id: string
  customer: string
  product: string
  amount: string
  status: "New" | "In Progress" | "Delivered" | "Cancelled"
  date: string
}

export function OrderCard({ id, customer, product, amount, status }: OrderCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "New":
        return "default"
      case "In Progress":
        return "secondary"
      case "Delivered":
        return "outline"
      default:
        return "destructive"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 text-sm truncate">{id}</p>
        <p className="text-sm text-gray-600 truncate">{customer}</p>
        <p className="text-xs text-gray-500 truncate sm:hidden">{product}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-medium text-gray-900 text-sm">{amount}</p>
        <Badge variant={getStatusVariant(status)} className="text-xs">
          {status}
        </Badge>
      </div>
    </div>
  )
}
