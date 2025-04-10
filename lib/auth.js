import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function verifyAuth(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { isAuthenticated: false }
    }

    // Extract token
    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    return {
      isAuthenticated: true,
      userId: decoded.userId,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return { isAuthenticated: false }
  }
}
