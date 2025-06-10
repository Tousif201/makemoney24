// Dummy Users
export const users = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "customer",
  },
  {
    _id: "user2",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "agent",
  },
  {
    _id: "user3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "customer",
  },
  {
    _id: "user4",
    name: "Emily Chen",
    email: "emily.chen@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "agent",
  },
  {
    _id: "user5",
    name: "David Brown",
    email: "david.brown@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "customer",
  },
]

// Dummy Tickets
export const tickets = [
  {
    _id: "ticket1",
    title: "Unable to login to my account",
    requester: "user1",
    assignedTo: "user2",
    description:
      "I've been trying to log into my account for the past hour but keep getting an error message saying 'Invalid credentials' even though I'm sure my password is correct.",
    status: "open",
    priority: "high",
    category: "technical_support",
    attachments: [
      {
        key: "screenshot1.png",
        url: "/placeholder.svg?height=200&width=300",
      },
    ],
    messages: ["msg1", "msg2", "msg3"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:45:00Z",
  },
  {
    _id: "ticket2",
    title: "Billing discrepancy on my invoice",
    requester: "user3",
    assignedTo: "user4",
    description:
      "I noticed that my latest invoice shows charges that don't match my subscription plan. Could you please review this?",
    status: "in_progress",
    priority: "medium",
    category: "billing_inquiry",
    attachments: [],
    messages: ["msg4", "msg5"],
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-15T11:20:00Z",
  },
  {
    _id: "ticket3",
    title: "Feature request: Dark mode support",
    requester: "user5",
    assignedTo: "user2",
    description:
      "It would be great if the application supported dark mode. Many users prefer this for better eye comfort during extended usage.",
    status: "resolved",
    priority: "low",
    category: "feature_request",
    attachments: [],
    messages: ["msg6", "msg7", "msg8", "msg9"],
    createdAt: "2024-01-10T16:20:00Z",
    updatedAt: "2024-01-13T13:30:00Z",
  },
  {
    _id: "ticket4",
    title: "App crashes when uploading large files",
    requester: "user1",
    assignedTo: "user4",
    description:
      "The application consistently crashes when I try to upload files larger than 50MB. This is affecting my workflow significantly.",
    status: "open",
    priority: "urgent",
    category: "bug_report",
    attachments: [
      {
        key: "crash-log.txt",
        url: "/placeholder.svg?height=100&width=200",
      },
      {
        key: "error-screenshot.png",
        url: "/placeholder.svg?height=200&width=300",
      },
    ],
    messages: ["msg10"],
    createdAt: "2024-01-16T08:45:00Z",
    updatedAt: "2024-01-16T08:45:00Z",
  },
  {
    _id: "ticket5",
    title: "Payment method update needed",
    requester: "user3",
    assignedTo: null,
    description: "I need to update my payment method as my credit card has expired. How can I do this?",
    status: "open",
    priority: "medium",
    category: "payment_issue",
    attachments: [],
    messages: [],
    createdAt: "2024-01-16T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
  },
]

// Dummy Messages
export const messages = [
  {
    _id: "msg1",
    ticketId: "ticket1",
    sender: "user1",
    message: "I've tried resetting my password multiple times but the issue persists. Can someone help me?",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "msg2",
    ticketId: "ticket1",
    sender: "user2",
    message:
      "Hi John, I'm looking into this issue. Can you please try clearing your browser cache and cookies, then attempt to log in again?",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-15T11:15:00Z",
  },
  {
    _id: "msg3",
    ticketId: "ticket1",
    sender: "user1",
    message: "I tried clearing the cache but still having the same issue. Here's a screenshot of the error.",
    attachments: [
      {
        key: "login-error.png",
        url: "/placeholder.svg?height=150&width=250",
      },
    ],
    isInternalNote: false,
    createdAt: "2024-01-15T14:45:00Z",
  },
  {
    _id: "msg4",
    ticketId: "ticket2",
    sender: "user3",
    message: "The invoice shows $99 but my plan should be $79. Please check this.",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-14T09:15:00Z",
  },
  {
    _id: "msg5",
    ticketId: "ticket2",
    sender: "user4",
    message:
      "I've reviewed your account and found the discrepancy. You were charged for an add-on service. I'll process a refund for the difference.",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-15T11:20:00Z",
  },
  {
    _id: "msg6",
    ticketId: "ticket3",
    sender: "user5",
    message: "This would really improve the user experience. Many modern apps have this feature.",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-10T16:20:00Z",
  },
  {
    _id: "msg7",
    ticketId: "ticket3",
    sender: "user2",
    message: "Thank you for the suggestion! I've forwarded this to our development team for consideration.",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-11T10:30:00Z",
  },
  {
    _id: "msg8",
    ticketId: "ticket3",
    sender: "user2",
    message: "Internal note: Development team has approved this feature for Q2 roadmap.",
    attachments: [],
    isInternalNote: true,
    createdAt: "2024-01-12T14:15:00Z",
  },
  {
    _id: "msg9",
    ticketId: "ticket3",
    sender: "user2",
    message:
      "Great news! Dark mode support has been added to our development roadmap and should be available in the next major release.",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-13T13:30:00Z",
  },
  {
    _id: "msg10",
    ticketId: "ticket4",
    sender: "user1",
    message: "This is really urgent as it's blocking my work. I've attached the crash log and error screenshot.",
    attachments: [],
    isInternalNote: false,
    createdAt: "2024-01-16T08:45:00Z",
  },
]

// Helper functions
export function getUserById(id) {
  return users.find((user) => user._id === id)
}

export function getTicketById(id) {
  return tickets.find((ticket) => ticket._id === id)
}

export function getMessagesByTicketId(ticketId) {
  return messages.filter((message) => message.ticketId === ticketId)
}

export function getTicketMessages(ticket) {
  return messages.filter((message) => ticket.messages.includes(message._id))
}
