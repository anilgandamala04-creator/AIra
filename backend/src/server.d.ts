import { Request, Response, NextFunction } from 'express';
declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
declare function checkRateLimit(req: Request, res: Response, next: NextFunction): void;
export { authMiddleware, checkRateLimit };
//# sourceMappingURL=server.d.ts.map