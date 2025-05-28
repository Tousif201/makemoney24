import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { CreateVendorDialog } from "../../../components/Dashboad/SalesRep/CreateVendorDialog";
import { VendorsTable } from "../../../components/Dashboad/SalesRep/VendorsTable";

export default function VendorsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground">Manage your vendor accounts</p>
          </div>
        </div>
        <CreateVendorDialog>
          <Button className=" bg-purple-700 hover:bg-purple-400">
            <Plus className="mr-2 h-4 w-4 " />
            Add Vendor
          </Button>
        </CreateVendorDialog>
      </div>

      <VendorsTable />
    </div>
  );
}
