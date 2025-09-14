// Fake users database (shared với login.post.ts trong thực tế nên dùng database thật)
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    userName: 'admin',
    avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    role: 'admin'
  },
  {
    id: '2', 
    email: 'user@example.com',
    password: 'user123',
    firstName: 'John',
    lastName: 'Doe', 
    userName: 'johndoe',
    avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light',
    role: 'user'
  }
]

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { firstName, lastName, email, userName, password, confirmPassword } = body

    // Validate input
    if (!firstName || !lastName || !email || !userName || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields are required'
      })
    }

    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Passwords do not match'
      })
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.userName === userName)
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email or username already exists'
      })
    }

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email,
      password, // Trong thực tế nên hash password
      firstName,
      lastName,
      userName,
      avatar: `https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=Brown&facialHairType=Blank&clotheType=GraphicShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light`,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to fake database
    users.push(newUser)

    return {
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userName: newUser.userName
      }
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Registration failed'
    })
  }
})
