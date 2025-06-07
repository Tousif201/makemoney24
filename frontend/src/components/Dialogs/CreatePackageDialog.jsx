import React, { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { CreateMembershipPackage } from "../../../api/membershipPackage"
import toast from "react-hot-toast"
const CreatePackageDialog = ({ packages, setPackages }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    packageAmount: "",
    miscellaneousAmount: "",
    description: "",
    validityInDays: "",
  })

  const handleSubmit = async(e) => {
    e.preventDefault()
    try {
        const packageData = { ...formData};
        const result = await CreateMembershipPackage(packageData);
        console.log(result)
        setFormData({
            name: "",
            packageAmount: "",
            miscellaneousAmount: "",
            price: "",
            description: "",
            validityInDays: "",
          })
        toast.success("membership package created successfully");
        setIsOpen(false)
    } catch (error) {
        console.error("error creating membership package",error);
        toast.error(err?.message || "Failed to create vendor");
    }
    // const newPackage = {
    //   id: Date.now().toString(),
    //   name: formData.name,
    //   packageAmount: parseFloat(formData.packageAmount),
    //   miscellaneousAmount: parseFloat(formData.miscellaneousAmount),
    //   description: formData.description,
    //   validityInDays: formData.validityInDays,
    // }

    // setPackages([...packages, newPackage])
   
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
          <DialogDescription>Fill in the details to create a new package.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Package Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* <div className="grid gap-2">
              <Label>Package Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="grid gap-2">
              <Label>PackageAmount (INR)</Label>
              <Input
                type="number"
                value={formData.packageAmount}
                onChange={(e) => setFormData({ ...formData, packageAmount: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>MiscellaneousAmount (INR)</Label>
              <Input
                type="number"
                value={formData.miscellaneousAmount}
                onChange={(e) => setFormData({ ...formData, miscellaneousAmount: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Validity</Label>
              <Input
                value={formData.validityInDays}
                onChange={(e) => setFormData({ ...formData, validityInDays: e.target.value })}
                required
                type = "number"
                placeholder = "e.g., 1 for 1 day,  30 for 1 month,  365 for 1 year"
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* <div className="grid gap-2">
              <Label>Features (comma-separated)</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                required
              />
            </div> */}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="bg-gray-800 text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePackageDialog
