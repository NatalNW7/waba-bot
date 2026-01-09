/**
 * Login request interface
 */
export interface ILoginRequest {
  email: string;
  password: string;
}

/**
 * Login response interface
 */
export interface ILoginResponse {
  access_token: string;
}
