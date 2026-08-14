export type AuthUser = {
  id: string;
  email: string;
};

/**
 * Backend-internal shape returned by the auth service. The access token
 * never crosses the wire to the frontend — it's set as an httpOnly cookie
 * by the sign-up/sign-in controllers, not included in the JSON response.
 */
export type AuthSession = {
  accessToken: string;
  expiresIn?: number;
  user: AuthUser;
};

/** Wire response for POST /auth/sign-up and /auth/sign-in. */
export type AuthUserResponse = {
  user: AuthUser;
};

export type MeResponse = {
  userId: string;
  email: string;
};
