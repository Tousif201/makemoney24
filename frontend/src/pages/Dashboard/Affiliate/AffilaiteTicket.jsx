import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Paperclip, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateTicketDialog } from "../../../components/Tickets/CreateTicketDialog";

// Import your API function
import { getTickets as fetchTicketsApi } from "../../../../api/ticket"; // Renamed to avoid conflict
import { useSession } from "../../../context/SessionContext";

const statusColors = {
  open: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  resolved: "bg-green-100 text-green-800 hover:bg-green-200",
  closed: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  reopened: "bg-red-100 text-red-800 hover:bg-red-200",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function AffiliateTicket() {
  const [tickets, setTickets] = useState([]); // State to hold fetched tickets
  const [loading, setLoading] = useState(true); // Loading state for fetching tickets
  const [error, setError] = useState(null); // Error state for fetching tickets

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all"); // Renamed to avoid confusion with backend `priority` field

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { session, loading: sessionLoading } = useSession();

  // Function to fetch tickets from the API
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (session?.role === "user") {
        filters.requesterId = session.id;
      }
      if (session?.role === "vendor") {
        filters.assignedToId = session.id;
      }
      const response = await fetchTicketsApi({ ...filters });
      // Assuming response.tickets is an array of ticket objects
      setTickets(response.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError(err.response?.data?.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]); // Depend on filters that are passed to API

  // Fetch tickets on component mount and when status filter changes
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]); // Re-run when fetchTickets callback itself changes (due to dependencies)

  // Filter tickets client-side based on searchTerm and priorityFilter
  // This is because the API might not support `searchTerm` and `priority` as direct filters
  const displayedTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Only apply client-side priority filter if the backend doesn't handle it
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Callback to refresh tickets after a new one is created
  const handleTicketCreated = () => {
    fetchTickets(); // Re-fetch all tickets to update the list
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track all customer support requests
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Create New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* Status filter is passed to API */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="reopened">Reopened</SelectItem>
              </SelectContent>
            </Select>
            {/* Priority filter is client-side */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-semibold">Loading tickets...</p>
              <p className="text-muted-foreground">
                Please wait while we fetch the tickets.
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-red-600">
              <h3 className="text-lg font-semibold">Error loading tickets</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchTickets} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : displayedTickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No tickets found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters, or create a new
                  ticket!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          displayedTickets.map((ticket) => {
            // Assuming requester and assignedTo are populated objects from the backend
            const requester = ticket.requester;
            const assignedAgent = ticket.assignedTo;

            return (
              <Card
                key={ticket._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Link
                        to={`/dashboard/tickets/${ticket._id}`}
                        className="text-lg font-semibold hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className={statusColors[ticket.status]}
                        >
                          {ticket.status.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={priorityColors[ticket.priority]}
                        >
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">
                          {ticket.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Paperclip className="h-4 w-4 mr-1" />
                          {ticket.attachments.length}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {requester && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={requester?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {requester?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {requester?.name}
                          </span>
                        </div>
                      )}
                      {assignedAgent && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Assigned to {assignedAgent.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-0 text-sm ">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTicketCreated={handleTicketCreated} // Pass the callback
      />
    </div>
  );
}
