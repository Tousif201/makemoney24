import React, { useState, useEffect } from "react"
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

const EditPackageDialog = ({ isOpen, setIsOpen, selectedPackage, packages, setPackages }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    validity: "",
  })

  useEffect(() => {
    if (selectedPackage) {
      setFormData({
        name: selectedPackage.name,
        price: selectedPackage.price.toString(),
        description: selectedPackage.description,
        validity: selectedPackage.validity,
      })
    }
  }, [selectedPackage])

  const handleSubmit = (e) => {
    e.preventDefault()

    const updatedPackage = {
      ...selectedPackage,
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      validity: formData.validity,
    }

    const updatedPackages = packages.map((pkg) =>
      pkg.id === selectedPackage.id ? updatedPackage : pkg
    )

    setPackages(updatedPackages)
    setIsOpen(false)
  }

  if (!selectedPackage) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
          <DialogDescription>Update the package details below.</DialogDescription>
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
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
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
              <Label>Price (INR)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Validity</Label>
              <Input
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                required
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="bg-red-500">
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600">Update Package</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPackageDialog
