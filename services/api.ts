// API Configuration
// Use your local IP address instead of localhost for mobile devices
const API_BASE_URL = 'http://192.168.0.4:3000/api';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fuelAccount?: {
    id: string;
    balance: number;
    creditLimit: number;
    status: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

// API Error Class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API request failed');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

// Authentication API methods
export const authAPI = {
  // Register new user
  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get current user profile
  getProfile: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    return apiRequest<{ user: User }>('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Logout user
  logout: async (token: string, refreshToken: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// Future API methods for other features
export const transactionAPI = {
  // Get user transactions
  getTransactions: async (token: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/transactions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Create new transaction
  createTransaction: async (token: string, transactionData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });
  },
};

export const qrAPI = {
  // Generate QR code (for attendants)
  generateQR: async (token: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/qr/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Validate QR code
  validateQR: async (token: string, qrCode: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/qr/${qrCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
