import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your-fake-jwt-secret-key'

// Fake users database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: '2', 
    email: 'user@example.com',
    role: 'user'
  }
]

export default defineEventHandler(async (event) => {
  try {
    // Get Authorization header
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required'
      })
    }

    const token = authorization.replace('Bearer ', '')

    // Verify current token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error: any) {
      // Token có thể expired, nhưng vẫn decode để lấy thông tin
      if (error.name === 'TokenExpiredError') {
        decoded = jwt.decode(token)
      } else {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid token'
        })
      }
    }

    // Find user
    const user = users.find(u => u.id === decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Generate new JWT token
    const newToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      data: {
        id_token: newToken
      }
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Token refresh failed'
    })
  }
})
