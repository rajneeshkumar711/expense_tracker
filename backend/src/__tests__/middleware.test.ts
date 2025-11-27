import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const token = jwt.sign(
        { id: '123', email: 'test@example.com', role: 'EMPLOYEE' },
        process.env.JWT_SECRET || 'secret'
      );

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe('123');
      expect(mockRequest.user?.email).toBe('test@example.com');
    });

    it('should reject request without token', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should authorize user with correct role', () => {
      mockRequest.user = {
        id: '123',
        email: 'admin@test.com',
        role: 'ADMIN' as any
      };

      const middleware = authorize('ADMIN' as any);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject user without correct role', () => {
      mockRequest.user = {
        id: '123',
        email: 'employee@test.com',
        role: 'EMPLOYEE' as any
      };

      const middleware = authorize('ADMIN' as any);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request without user', () => {
      const middleware = authorize('ADMIN' as any);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
