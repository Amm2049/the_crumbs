import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { handleUpdate, handleDelete, OwnershipCheck, response } from '@/lib/api-helper'

export async function PATCH(request, { params }) {
  const session = await auth()
  const { id } = await params
  const { quantity } = await request.json()

  // Validate quantity is a positive integer
  if (!Number.isInteger(quantity) || quantity < 1) {
    return response({ error: 'Quantity must be a positive integer' }, 400)
  }

  const check = await OwnershipCheck(id, db.cartItem, session, {
    include: { product: { select: { stock: true, isAvailable: true, name: true } } }
  })
  if (check.error) return check.error

  // Validate stock availability
  const product = check.data.product
  if (!product.isAvailable) {
    return response({ error: `"${product.name}" is no longer available` }, 400)
  }
  if (quantity > product.stock) {
    return response({ error: `Only ${product.stock} units of "${product.name}" are available` }, 400)
  }

  return handleUpdate(id, db.cartItem, { data: { quantity } })
}

export async function DELETE(request, { params }) {
  const session = await auth()
  const { id } = await params
  
  const check = await OwnershipCheck(id, db.cartItem, session)
  if (check.error) return check.error

  return handleDelete(id, db.cartItem)
}