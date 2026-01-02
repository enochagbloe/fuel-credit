
// User data returned from auth queries
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isVerified: boolean
  fuelAccount: {
    id: string
    balance: number
    creditLimit: number
    status: string
  } | null
}

// Extended Request with user data
export interface AuthRequest extends Request {
  user?: AuthUser
}

// Token pair
export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  message: string
  data?: T
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fuelAccount?: {
      id: string
      balance: number
      creditLimit: number
      status?: string
    }
  }
  tokens: TokenPair
}
