import { api } from "../api";
import type { DashboardAnalytics, DashboardOverview, DashboardRecent } from "../../types";

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const response = await api.get<{ data: DashboardOverview }>("/dashboard/overview");
  return response.data.data;
}

export async function fetchDashboardAnalytics(days?: number): Promise<DashboardAnalytics> {
  const response = await api.get<{ data: DashboardAnalytics }>(
    `/dashboard/analytics${days ? `?days=${days}` : ""}`
  );
  return response.data.data;
}

export async function fetchDashboardRecent(): Promise<DashboardRecent> {
  const response = await api.get<{ data: DashboardRecent }>("/dashboard/recent");
  return response.data.data;
}
