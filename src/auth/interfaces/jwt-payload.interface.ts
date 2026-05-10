export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iss: string;
  iat: number;
  exp: number;
  jti?: string;
}
