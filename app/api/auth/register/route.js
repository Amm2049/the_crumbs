// register new user account
import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { response, handleApiError } from '@/lib/utils'

export async function POST(request){
  try {
    const body = await request.json()
    const name = body.name?.trim() ?? ''
    const email = body.email?.trim() ?? ''
    const password = body.password ?? '' // Passwords shouldn't be trimmed but shouldn't be only whitespace either

    if (!name || !email || !password || password.trim() === '') {
      return response({ error: 'Missing required fields' }, 400)
    }

    // Basic email regex
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return response({ error: 'Invalid email format' }, 400);
    }

    if (password.length < 8) {
      return response({ error: 'Password must be at least 8 characters' }, 400);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: { name, email, password: hashedPassword }
    })

    return response(
      { id: user.id, name: user.name, email: user.email },
      201
    )
  } catch (error){
    return handleApiError(error, { P2002: 'Email already in use' })
  }
}