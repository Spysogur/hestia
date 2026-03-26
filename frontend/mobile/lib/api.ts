import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import {
  ApiResponse,
  AuthResponse,
  ActivateEmergencyPayload,
  Community,
  CreateHelpOfferPayload,
  CreateHelpRequestPayload,
  Emergency,
  HelpOffer,
  HelpRequest,
  LoginPayload,
  RegisterPayload,
  User,
} from "./types";

// Configure via app.json extra.apiUrl or EXPO_PUBLIC_API_URL env var
export const API_URL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:5000";
export const TOKEN_KEY = "hestia_jwt";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach token to every request
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

// ---- Auth ----
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", payload).then(unwrap),
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", payload).then(unwrap),
};

// ---- Communities ----
export const communitiesApi = {
  list: () =>
    apiClient.get<ApiResponse<Community[]>>("/communities").then(unwrap),
  nearby: (lat: number, lng: number, radius = 50) =>
    apiClient
      .get<ApiResponse<Community[]>>(`/communities/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
      .then(unwrap),
  get: (id: string) =>
    apiClient.get<ApiResponse<Community>>(`/communities/${id}`).then(unwrap),
  create: (payload: Partial<Community>) =>
    apiClient.post<ApiResponse<Community>>("/communities", payload).then(unwrap),
  join: (id: string) =>
    apiClient.post<ApiResponse<User>>(`/communities/${id}/join`).then(unwrap),
};

// ---- Emergencies ----
export const emergenciesApi = {
  active: (communityId?: string) => {
    const params = communityId ? `?communityId=${communityId}` : "";
    return apiClient.get<ApiResponse<Emergency[]>>(`/emergencies/active${params}`).then(unwrap);
  },
  get: (id: string) =>
    apiClient.get<ApiResponse<Emergency>>(`/emergencies/${id}`).then(unwrap),
  activate: (payload: ActivateEmergencyPayload) =>
    apiClient.post<ApiResponse<Emergency>>("/emergencies/activate", payload).then(unwrap),
  resolve: (id: string) =>
    apiClient.put<ApiResponse<Emergency>>(`/emergencies/${id}/resolve`).then(unwrap),
  escalate: (id: string) =>
    apiClient.put<ApiResponse<Emergency>>(`/emergencies/${id}/escalate`).then(unwrap),
};

// ---- Help ----
export const helpApi = {
  createRequest: (payload: CreateHelpRequestPayload) =>
    apiClient.post<ApiResponse<HelpRequest>>("/help/requests", payload).then(unwrap),
  getRequests: (emergencyId: string) =>
    apiClient
      .get<ApiResponse<HelpRequest[]>>(`/help/requests/emergency/${emergencyId}`)
      .then(unwrap),
  createOffer: (payload: CreateHelpOfferPayload) =>
    apiClient.post<ApiResponse<HelpOffer>>("/help/offers", payload).then(unwrap),
  getOffers: (emergencyId: string) =>
    apiClient
      .get<ApiResponse<HelpOffer[]>>(`/help/offers/emergency/${emergencyId}`)
      .then(unwrap),
  match: (requestId: string, offerId: string) =>
    apiClient.post<ApiResponse<unknown>>(`/help/match/${requestId}/${offerId}`).then(unwrap),
  autoMatch: (emergencyId: string) =>
    apiClient.post<ApiResponse<unknown>>(`/help/auto-match/${emergencyId}`).then(unwrap),
};
