import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetMeResponse,
  UpdateProfileBody,
  GetCreditsResponse,
  ListTransactionsResponse,
  CreatePaymentBody,
  CreatePaymentResponse,
  ListSitesResponse,
  GetSiteResponse,
  GenerateSiteBody,
  GenerateSiteResponse,
  GetDashboardStatsResponse,
  GetRecentSitesResponse,
} from "@workspace/api-zod";

// ─── Auth token plumbing ──────────────────────────────────────────────────

let _getToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

// ─── Base fetch ──────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = _getToken ? await _getToken() : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Hooks ───────────────────────────────────────────────────────────────

// Auth / Profile
export function useGetMe(options?: { query?: { enabled?: boolean } }) {
  return useQuery<GetMeResponse>({
    queryKey: ["me"],
    queryFn: () => apiFetch<GetMeResponse>("/api/auth/me"),
    enabled: options?.query?.enabled ?? true,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileBody) =>
      apiFetch<GetMeResponse>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// Credits
export function useGetCredits(options?: { query?: { enabled?: boolean } }) {
  return useQuery<GetCreditsResponse>({
    queryKey: ["credits"],
    queryFn: () => apiFetch<GetCreditsResponse>("/api/credits"),
    enabled: options?.query?.enabled ?? true,
  });
}

export function useListTransactions() {
  return useQuery<ListTransactionsResponse>({
    queryKey: ["transactions"],
    queryFn: () =>
      apiFetch<ListTransactionsResponse>("/api/credits/transactions"),
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePaymentBody) =>
      apiFetch<CreatePaymentResponse>("/api/credits/purchase", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

// Sites
export function useListSites() {
  return useQuery<ListSitesResponse>({
    queryKey: ["sites"],
    queryFn: () => apiFetch<ListSitesResponse>("/api/sites"),
  });
}

export function useGetRecentSites() {
  return useQuery<GetRecentSitesResponse>({
    queryKey: ["sites", "recent"],
    queryFn: () => apiFetch<GetRecentSitesResponse>("/api/sites/recent"),
  });
}

export function useGetSite(id: number) {
  return useQuery<GetSiteResponse>({
    queryKey: ["sites", id],
    queryFn: () => apiFetch<GetSiteResponse>(`/api/sites/${id}`),
    enabled: !!id,
  });
}

export function useGenerateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateSiteBody) =>
      apiFetch<GenerateSiteResponse>("/api/sites/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/sites/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// Dashboard
export function useGetDashboardStats() {
  return useQuery<GetDashboardStatsResponse>({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      apiFetch<GetDashboardStatsResponse>("/api/dashboard/stats"),
  });
}
