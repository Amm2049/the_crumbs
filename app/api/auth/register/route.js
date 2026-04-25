// register new user account
import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { response, handleApiError } from '@/lib/utils'

export async function POST(request){
  try {
    const {name, email, password} = await request.json()

    if (!name || !email || !password){
      return response({ error: 'Missing required fields'}, 400)
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