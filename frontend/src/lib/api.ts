const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('cc_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Auth API response types
export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN' | 'GUEST';
  location?: string;
  createdAt: string;
  preferences?: any;
}

export interface LoginResponse {
  user: AuthUserData;
  token: string;
}

export interface RegisterResponse {
  user: AuthUserData;
  token: string;
}

export interface GetMeResponse {
  user: AuthUserData;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  message: string;
}

// Auth API endpoints
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    location?: string;
    role?: 'USER' | 'ORGANIZER';
  }) => {
    return api.post<RegisterResponse>('/auth/register', data);
  },

  login: async (data: { email: string; password: string }) => {
    return api.post<LoginResponse>('/auth/login', data);
  },

  getMe: async () => {
    return api.get<GetMeResponse>('/auth/me');
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  verifyResetToken: async (token: string) => {
    return api.post<VerifyResetTokenResponse>('/auth/verify-reset-token', { token });
  },
};

