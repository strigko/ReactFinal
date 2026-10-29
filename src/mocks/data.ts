import type {
  User,
  Category,
  Priority,
  RequestStatus,
  ServiceRequest,
  RequestComment,
  StatusHistory
} from "../types";

export const users: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "user@example.com",
    password: "user123",
    role: "user"
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "operator@example.com",
    password: "operator123",
    role: "operator"
  }
];

export const categories: Category[] = [
  { id: "1", name: "Computer equipment" },
  { id: "2", name: "Network" },
  { id: "3", name: "Printers" }
];

export const priorities: Priority[] = [
  { id: "1", name: "Low", level: 1 },
  { id: "2", name: "Medium", level: 2 },
  { id: "3", name: "High", level: 3 }
];

export const statuses: RequestStatus[] = [
  { id: "1", name: "New" },
  { id: "2", name: "In progress" },
  { id: "3", name: "Waiting for parts" },
  { id: "4", name: "Completed" }
];

export const requests: ServiceRequest[] = [
  {
    id: "1",
    title: "Computer does not start",
    description: "The computer does not turn on.",
    categoryId: "1",
    priorityId: "3",
    statusId: "2",
    userId: "1",
    contactName: "John Smith",
    contactEmail: "user@example.com",
    contactPhone: "+380501112233",
    createdAt: "2026-10-25T09:00:00.000Z"
  },
  {
    id: "2",
    title: "Slow internet connection",
    description: "The internet connection is very slow.",
    categoryId: "2",
    priorityId: "2",
    statusId: "1",
    userId: "1",
    contactName: "John Smith",
    contactEmail: "user@example.com",
    contactPhone: "+380501112233",
    createdAt: "2026-10-25T10:00:00.000Z"
  },
  {
    id: "3",
    title: "Printer is not working",
    description: "The printer does not print documents.",
    categoryId: "3",
    priorityId: "1",
    statusId: "4",
    userId: "1",
    contactName: "John Smith",
    contactEmail: "user@example.com",
    contactPhone: "+380501112233",
    createdAt: "2026-10-24T11:00:00.000Z"
  },
  {
    id: "4",
    title: "Network connection lost",
    description: "The office computer cannot connect to the network.",
    categoryId: "2",
    priorityId: "3",
    statusId: "3",
    userId: "1",
    contactName: "John Smith",
    contactEmail: "user@example.com",
    contactPhone: "+380501112233",
    createdAt: "2026-10-23T12:00:00.000Z"
  },
  {
    id: "5",
    title: "Keyboard replacement",
    description: "Several keyboard keys do not work.",
    categoryId: "1",
    priorityId: "1",
    statusId: "1",
    userId: "2",
    contactName: "Sarah Wilson",
    contactEmail: "operator@example.com",
    contactPhone: "+380671234567",
    createdAt: "2026-10-22T13:00:00.000Z"
  }
];

export const comments: RequestComment[] = [
  {
    id: "1",
    requestId: "1",
    userId: "2",
    userName: "Sarah Wilson",
    text: "We are checking the power supply.",
    createdAt: "2026-10-25T10:00:00.000Z"
  },
  {
    id: "2",
    requestId: "3",
    userId: "2",
    userName: "Sarah Wilson",
    text: "The printer has been repaired.",
    createdAt: "2026-10-24T12:00:00.000Z"
  }
];

export const history: StatusHistory[] = [
  {
    id: "1",
    requestId: "1",
    oldStatus: "New",
    newStatus: "In progress",
    changedBy: "Sarah Wilson",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    requestId: "2",
    oldStatus: "In progress",
    newStatus: "Waiting for parts",
    changedBy: "Sarah Wilson",
    createdAt: new Date().toISOString(),
  },
];

