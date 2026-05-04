export type AuthUser = {
  id: string
  email: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

// Note: tokens are treated as opaque on the client. Do not decode JWTs here.
// The backend is the source of truth for token validity and expiry.
