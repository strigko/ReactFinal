
export type UserRole = "user" | "operator";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type Category = {
  id: string;
  name: string;
};

export type Priority = {
  id: string;
  name: string;
  level: number;
};

export type RequestStatus = {
  id: string;
  name: string;
};

export type ServiceRequest = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priorityId: string;
  statusId: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
};

export type RequestComment = {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

export type StatusHistory = {
  id: string;
  requestId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: Omit<User, "password">;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
