import { api } from "./axios";
import type {
  ServiceRequest,
  RequestStatus,
  Category,
  Priority,
  RequestComment,
  StatusHistory,
} from "../types";

export async function getMyRequests() {
  const response = await api.get<ServiceRequest[]>("/requests/my");
  return response.data;
}

export async function getAllRequests(statusId?: string) {
  const response = await api.get<ServiceRequest[]>("/requests", {
    params: statusId ? { status: statusId } : {},
  });

  return response.data;
}

export async function getRequestStatuses() {
  const response = await api.get<RequestStatus[]>("/request-statuses");
  return response.data;
}

export async function getCategories() {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function getPriorities() {
  const response = await api.get<Priority[]>("/priorities");
  return response.data;
}

export async function getRequestById(id: string) {
  const response = await api.get<ServiceRequest>(`/requests/${id}`);
  return response.data;
}

export async function getRequestComments(id: string) {
  const response = await api.get<RequestComment[]>(
    `/requests/${id}/comments`
  );
  return response.data;
}

export async function getRequestHistory(id: string) {
  const response = await api.get<StatusHistory[]>(
    `/requests/${id}/history`
  );
  return response.data;
}

export async function updateRequestStatus(id: string, statusId: string) {
  const response = await api.patch<ServiceRequest>(
    `/requests/${id}/status`,
    { statusId }
  );

  return response.data;
}

export async function addRequestComment(id: string, text: string) {
  const response = await api.post<RequestComment>(
    `/requests/${id}/comments`,
    { text }
  );

  return response.data;
}
