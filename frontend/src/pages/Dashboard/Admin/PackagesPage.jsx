"use client"

import React, { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import CreatePackageDialog from "../../../../src/components/Dialogs/CreatePackageDialog"
import EditPackageDialog from "../../../../src/components/Dialogs/EditPackageDialog"


const PackagesPage = () => {
  const [packages, setPackages] = useState([
    {
      id: "1",
      name: "Basic Plan",
      price: 2999,
      description: "Perfect for small businesses",
      validity: "1 month",
    },
    {
      id: "2",
      name: "Pro Plan",
      price: 5999,
      description: "Great for growing companies",
      validity: "1 month",
    },
  ])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)

//   const handleDelete = (id) => {
//     setPackages(packages.filter((pkg) => pkg.id !== id))
//   }

//   const getTypeColor = (type) => {
//     switch (type) {
//       case "Silver":
//         return "bg-gray-100 text-gray-800"
//       case "Gold":
//         return "bg-yellow-100 text-yellow-800"
//       case "Platinum":
//         return "bg-purple-100 text-purple-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-muted-foreground mt-2">Manage your service packages</p>
        </div>

        <CreatePackageDialog packages={packages} setPackages={setPackages} />
      </div>

      <EditPackageDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        selectedPackage={selectedPackage}
        packages={packages}
        setPackages={setPackages}
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableCaption>A list of your service packages.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              {/* <TableHead>Type</TableHead> */}
              <TableHead>Price</TableHead>    
              <TableHead>Validity</TableHead>
              <TableHead>Description</TableHead>
              
              {/* <TableHead>Features</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No packages found. Create your first package to get started.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  {/* <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pkg.type)}`}>
                      {pkg.type}
                    </span>
                  </TableCell> */}
                  <TableCell>₹{pkg.price.toFixed(2)}</TableCell>
                  <TableCell>{pkg.validity}</TableCell>
                  <TableCell className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{pkg.description}</TableCell>
                  {/* <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {pkg.features.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{pkg.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPackage(pkg)
                          setIsEditOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default PackagesPage
