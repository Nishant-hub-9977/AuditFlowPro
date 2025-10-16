import type { TokenPayload } from "../../server/auth";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }

    interface Response {
      locals: {
        tenantId?: string;
        userId?: string | null;
        userRole?: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};
