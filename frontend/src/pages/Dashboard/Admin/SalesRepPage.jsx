"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesRepCards } from "../../../components/Dashboad/SalesRep/SalesRepCards"; // Assuming this exists
import { SalesRepTable } from "../../../components/Dashboad/SalesRep/CreatesalesRepTable";
import { CreateSalesRepDialog } from "../../../components/Dashboad/SalesRep/CreateSalesRepDialog";
import {
  CreateSalesRep,
  getAllSalesRep,
//   UpdateSalesRep, // Assuming you have an UpdateSalesRep API
  deleteSalesRep, // Assuming you have a DeleteSalesRep API
} from "../../../../api/salesrep"; // Import your API functions
import { toast } from "sonner";
// import { useToaster } from "react-hot-toast";  // Assuming you have a toast notification system

export default function SalesRepsPage() {
  const [salesReps, setSalesReps] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Not used if using Toast only

//   const { toast } = useToast();

  // Function to fetch sales reps from backend
  const fetchSalesReps = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await getAllSalesRep();
      if (response.success) {
        setSalesReps(response.data || []); // Backend returns data in 'data' field
      } else {
        setError(response.message || "Failed to fetch sales representatives.");
        toast({
          title: "Error",
          description: response.message || "Failed to fetch sales representatives.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching sales reps:", err);
      setError(err.message || "Failed to fetch sales representatives.");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch sales representatives.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReps();
  }, []);

  const handleCreateSalesRep = async (newSalesRepData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear success message from previous operations
    try {
      const response = await CreateSalesRep(newSalesRepData);
      if (response.success) {
        setSuccessMessage("Sales representative created successfully!"); // This will be handled by toast
        window.location.reload()
        toast({
          title: "Success",
          description: "Sales representative created successfully!",
          duration: 3000,
        });
        setIsCreateDialogOpen(false); // Close dialog on successful creation
        fetchSalesReps(); // Re-fetch data to update the table/cards
      } else {
        setError(response.message || "Failed to create sales representative.");
        toast({
          title: "Error",
          description: response.message || "Failed to create sales representative.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error creating sales rep:", err);
      setError(err.message || "Failed to create sales representative.");
      toast({
        title: "Error",
        description: err.message || "Failed to create sales representative.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSalesRep = async (id) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await deleteSalesRep(id);
      if (response.success) {
        setSuccessMessage("Sales representative deleted successfully."); // This will be handled by toast
        window.location.reload()
        toast({
          title: "Success",
          description: "Sales representative deleted successfully.",
          duration: 3000,
        });
        fetchSalesReps(); // Re-fetch data
      } else {
        setError(response.message || "Failed to delete sales representative.");
        toast({
          title: "Error",
          description: response.message || "Failed to delete sales representative.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error deleting sales rep:", err);
      setError(err.message || "Failed to delete sales representative.");
      toast({
        title: "Error",
        description: err.message || "Failed to delete sales representative.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

//   const handleUpdateSalesRep = async (updatedRepData) => {
//     setLoading(true);
//     setError(null);
//     setSuccessMessage(null);
//     try {
//       // Assuming your UpdateSalesRep API takes the ID from the object and sends the whole object
//       const response = await UpdateSalesRep(updatedRepData._id, updatedRepData);
//       if (response.success) {
//         setSuccessMessage("Sales representative updated successfully."); // This will be handled by toast
//         toast({
//           title: "Success",
//           description: "Sales representative updated successfully.",
//           duration: 3000,
//         });
//         fetchSalesReps(); // Re-fetch data
//       } else {
//         setError(response.message || "Failed to update sales representative.");
//         toast({
//           title: "Error",
//           description: response.message || "Failed to update sales representative.",
//           variant: "destructive",
//           duration: 5000,
//         });
//       }
//     } catch (err) {
//       console.error("Error updating sales rep:", err);
//       setError(err.message || "Failed to update sales representative.");
//       toast({
//         title: "Error",
//         description: err.message || "Failed to update sales representative.",
//         variant: "destructive",
//         duration: 5000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sales Representatives
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your sales team and track their performance
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Sales Rep
        </Button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          {/* <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" /> */}
          <p className="text-blue-600">Loading sales representatives...</p>
        </div>
      )}

      {/* Cards (if SalesRepCards component uses 'salesReps' prop directly) */}
      {!loading && salesReps.length > 0 && (
        <div className="overflow-x-auto">
          <SalesRepCards salesReps={salesReps} />
        </div>
      )}
       {!loading && salesReps.length === 0 && (
        <div className="text-center text-gray-500 p-4">
          No sales representatives to display. Create one to get started!
        </div>
      )}


      {/* Table */}
      <div className="overflow-x-auto">
        <SalesRepTable
          salesReps={salesReps}
          onDelete={handleDeleteSalesRep}
        //   onUpdate={handleUpdateSalesRep}
        />
      </div>

      {/* Create Dialog */}
      <CreateSalesRepDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSalesRep}
        loading={loading}
        setError={setError} // For direct errors from document upload
      />
    </div>
  );
}