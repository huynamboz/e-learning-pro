import jwt from 'jsonwebtoken'

// Fake users database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // Trong thực tế nên hash password
    firstName: 'Admin',
    lastName: 'User',
    userName: 'admin',
    avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    role: 'admin',
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
  },
]

const JWT_SECRET = 'your-fake-jwt-secret-key'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password',
      })
    }

    // Check password (trong thực tế nên dùng bcrypt)
    if (user.password !== password) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password',
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    return {
      data: {
        id_token: token,
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Login failed',
    })
  }
})
