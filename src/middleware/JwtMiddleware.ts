import { IncomingMessage } from "http";
import * as jwt from 'jsonwebtoken'; // Import JWT library
import * as cookie from 'cookie';  // Import the cookie package

const JWT_SECRET = 'your-secret-key'; // Replace with your actual secret key

export class JwtMiddleware {

    // Middleware to verify the JWT token
    public verifyJWTToken(info: { req: IncomingMessage }, callback: (result: boolean, code?: number, message?: string) => void) {
        const token = '12234567'//this.getTokenFromHeaders(info.req); // Extract token from headers or cookies

        if (!token) {
            callback(false, 401, 'Unauthorized: No token provided');
            return;
        }

        // Verify the JWT token
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                callback(false, 401, 'Unauthorized: Invalid token');
                return;
            }

            // Optionally, store the decoded token or user information on the connection
            // info.req.user = decoded;
            callback(true); // Proceed with the connection
        });
    }

    // Helper function to extract JWT token from request headers or cookies
    private getTokenFromHeaders(req: IncomingMessage): string | undefined {
        console.log("getting token")
        // Extract token from Authorization header
        const token = req.headers['Authorization'] as string;
        if (token && token.startsWith('Bearer ')) {
            return token.slice(7); // Remove "Bearer " from token
        } else {
            // Extract token from cookies
            const cookies = cookie.parse(req.headers['cookie'] || ''); // Parse cookies from the request header
            return cookies['jwt'] || undefined; // Return the token from the "jwt" cookie (change 'jwt' if needed)
        }
    }
}
