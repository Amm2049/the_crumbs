import db from '@/lib/db'

export const metadata = {
  title: 'Customers | The Crumbs Admin',
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default async function AdminCustomersPage() {
  let customers = []
  let hasDataError = false

  try {
    customers = await db.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    hasDataError = true
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-[#4D321E]">Customers</h1>
        <p className="mt-1 text-sm text-[#7A5D4B]">Read-only view of registered customers.</p>
      </div>

      {hasDataError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-[#6B4C3B]">
          Customers data is not ready yet.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-[#6B4C3B]">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-amber-50/70 text-xs uppercase tracking-wide text-[#7A5D4B]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-amber-100/80">
                    <td className="px-4 py-3 font-semibold text-[#4D321E]">{customer.name}</td>
                    <td className="px-4 py-3 text-[#6B4C3B]">{customer.email}</td>
                    <td className="px-4 py-3 text-[#6B4C3B]">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-3 text-[#6B4C3B]">{customer._count?.orders ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
