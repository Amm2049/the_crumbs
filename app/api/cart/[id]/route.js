import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { handleUpdate, handleDelete, OwnershipCheck } from '@/lib/api-helper'

export async function PATCH(request, { params }) {
  const session = await auth()
  const { id } = await params
  const { quantity } = await request.json()

  const check = await OwnershipCheck(id, db.cartItem, session)
  if (check.error) return check.error

  return handleUpdate(id, db.cartItem, { data: { quantity } })
}

export async function DELETE(request, { params }) {
  const session = await auth()
  const { id } = await params
  
  const check = await OwnershipCheck(id, db.cartItem, session)
  if (check.error) return check.error

  return handleDelete(id, db.cartItem)
}