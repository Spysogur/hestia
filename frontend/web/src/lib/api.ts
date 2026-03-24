import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  ApiResponse,
  AuthUser,
  Community,
  Emergency,
  HelpOffer,
  HelpRequest,
  LoginInput,
  LoginResponse,
  RegisterInput,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function createClient(): AxiosInstance {
  const client = axios.create({ baseURL: BASE_URL });

  client.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const http = createClient();

function unwrap<T>(res: AxiosResponse<ApiResponse<T>>): T {
  if (!res.data.data) throw new Error(res.data.message || 'No data returned');
  return res.data.data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (input: RegisterInput): Promise<AuthUser> => {
    const res = await http.post<ApiResponse<AuthUser>>('/auth/register', input);
    return unwrap(res);
  },

  login: async (input: LoginInput): Promise<LoginResponse> => {
    const res = await http.post<ApiResponse<LoginResponse>>('/auth/login', input);
    return unwrap(res);
  },
};

// ─── Communities ──────────────────────────────────────────────────────────────

export const communityApi = {
  getAll: async (): Promise<Community[]> => {
    const res = await http.get<ApiResponse<Community[]>>('/communities');
    return unwrap(res);
  },

  getNearby: async (lat: number, lng: number, radius = 50): Promise<Community[]> => {
    const res = await http.get<ApiResponse<Community[]>>('/communities/nearby', {
      params: { lat, lng, radius },
    });
    return unwrap(res);
  },

  getById: async (id: string): Promise<Community> => {
    const res = await http.get<ApiResponse<Community>>(`/communities/${id}`);
    return unwrap(res);
  },

  create: async (data: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    radiusKm: number;
    country: string;
    region: string;
  }): Promise<Community> => {
    const res = await http.post<ApiResponse<Community>>('/communities', data);
    return unwrap(res);
  },

  join: async (id: string): Promise<{ id: string; communityId: string }> => {
    const res = await http.post<ApiResponse<{ id: string; communityId: string }>>(`/communities/${id}/join`);
    return unwrap(res);
  },
};

// ─── Emergencies ──────────────────────────────────────────────────────────────

export const emergencyApi = {
  getActive: async (communityId?: string): Promise<Emergency[]> => {
    const res = await http.get<ApiResponse<Emergency[]>>('/emergencies/active', {
      params: communityId ? { communityId } : undefined,
    });
    return unwrap(res);
  },

  getById: async (id: string): Promise<Emergency> => {
    const res = await http.get<ApiResponse<Emergency>>(`/emergencies/${id}`);
    return unwrap(res);
  },

  activate: async (data: {
    communityId: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    radiusKm: number;
  }): Promise<Emergency> => {
    const res = await http.post<ApiResponse<Emergency>>('/emergencies/activate', data);
    return unwrap(res);
  },

  resolve: async (id: string): Promise<Emergency> => {
    const res = await http.put<ApiResponse<Emergency>>(`/emergencies/${id}/resolve`, {});
    return unwrap(res);
  },

  escalate: async (id: string): Promise<Emergency> => {
    const res = await http.put<ApiResponse<Emergency>>(`/emergencies/${id}/escalate`);
    return unwrap(res);
  },
};

// ─── Help ─────────────────────────────────────────────────────────────────────

export const helpApi = {
  createRequest: async (data: {
    emergencyId: string;
    type: string;
    priority: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    numberOfPeople: number;
  }): Promise<HelpRequest> => {
    const res = await http.post<ApiResponse<HelpRequest>>('/help/requests', data);
    return unwrap(res);
  },

  getRequestsByEmergency: async (emergencyId: string): Promise<HelpRequest[]> => {
    const res = await http.get<ApiResponse<HelpRequest[]>>(`/help/requests/emergency/${emergencyId}`);
    return unwrap(res);
  },

  createOffer: async (data: {
    emergencyId: string;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    capacity?: number;
  }): Promise<HelpOffer> => {
    const res = await http.post<ApiResponse<HelpOffer>>('/help/offers', data);
    return unwrap(res);
  },

  getOffersByEmergency: async (emergencyId: string): Promise<HelpOffer[]> => {
    const res = await http.get<ApiResponse<HelpOffer[]>>(`/help/offers/emergency/${emergencyId}`);
    return unwrap(res);
  },

  match: async (requestId: string, offerId: string): Promise<{ request: HelpRequest; offer: HelpOffer }> => {
    const res = await http.post<ApiResponse<{ request: HelpRequest; offer: HelpOffer }>>(
      `/help/match/${requestId}/${offerId}`
    );
    return unwrap(res);
  },

  autoMatch: async (emergencyId: string): Promise<{ matches: Array<{ requestId: string; offerId: string }> }> => {
    const res = await http.post<ApiResponse<{ matches: Array<{ requestId: string; offerId: string }> }>>(
      `/help/auto-match/${emergencyId}`
    );
    return unwrap(res);
  },
};
