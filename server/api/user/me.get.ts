import jwt from 'jsonwebtoken'

// Fake users database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    userName: 'admin',
    avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
    role: 'user',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

const JWT_SECRET = 'your-fake-jwt-secret-key'

export default defineEventHandler(async (event) => {
  try {
    // Get Authorization header
    const authorization = getHeader(event, 'authorization')

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required',
      })
    }

    const token = authorization.replace('Bearer ', '')

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    }
    catch {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token',
      })
    }

    // Find user
    const user = users.find(u => u.id === decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Return user data (không trả về password)
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to get user profile',
    })
  }
})
