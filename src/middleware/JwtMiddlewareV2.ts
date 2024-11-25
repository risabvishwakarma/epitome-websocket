import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // Replace with your actual secret key

class JwtMiddlewareV2 {
  public static verifyToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
      //test
        if(token.length>0){
            next();
        }


      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          res.status(403).json({ message: 'Invalid token' });
        } else {
          (req as any).user = user; // Attach user information to request
          next();
        }
      });
    } else {
      res.status(401).json({ message: 'No token provided' });
    }
  }
}

export default JwtMiddlewareV2;
