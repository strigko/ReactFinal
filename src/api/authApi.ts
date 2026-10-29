import { api } from "./axios";
import type { LoginResponse, User } from "../types";

export type LoginData = {
  email: string;
  password: string;
};

export async function login(data: LoginData) {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<Omit<User, "password">>("/auth/me");
  return response.data;
}
