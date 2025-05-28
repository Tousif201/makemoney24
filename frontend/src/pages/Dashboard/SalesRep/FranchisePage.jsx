import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import { CreateFranchiseDialog } from "../../../components/Dashboad/SalesRep/CreateFranchiseDialog"
import { FranchiseTable } from "../../../components/Dashboad/SalesRep/FranchiseTable"

export default function FranchisePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Franchises</h1>
            <p className="text-muted-foreground">Manage your franchise accounts</p>
          </div>
        </div>
        <CreateFranchiseDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Franchise
          </Button>
        </CreateFranchiseDialog>
      </div>

      <FranchiseTable />
    </div>
  )
}
