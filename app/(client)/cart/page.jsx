import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CartPage from './CartPage'

export const metadata = {
  title: 'Your Cart | The Crumbs',
}

export default async function CartPageWrapper() {
  const session = await auth()
  if (!session) redirect('/login')

  return <CartPage />
}
