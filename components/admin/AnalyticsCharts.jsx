'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ShoppingBag, Tag, Award, AlertCircle } from 'lucide-react'

const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch analytics data')
  }
  return res.json()
}

// Color palette matching "Honey & Cream" theme
const COLORS = [
  '#D97706', // Warm amber-600
  '#F59E0B', // Amber-500
  '#B45309', // Amber-700
  '#FCD34D', // Amber-300
  '#78350F', // Amber-900
]

const STATUS_COLORS = {
  delivered: '#26ff00ff', // Emerald-500
  ready: '#6366F1',     // Indigo-500
  processing: '#3B82F6', // Blue-500
  pending: '#F59E0B',    // Amber-500
  cancelled: '#EF4444',  // Red-500
}

export default function AnalyticsCharts() {
  const [mounted, setMounted] = useState(false)
  const { data, error, isLoading } = useSWR('/api/admin/dashboard/analytics', fetcher)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted || isLoading) {
    return <AnalyticsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 p-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        <h3 className="mt-4 text-base font-bold text-red-900 dark:text-red-200">Failed to load analytics</h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error.message || 'Please try refreshing the page.'}</p>
      </div>
    )
  }

  const {
    revenueByDay = [],
    ordersByDay = [],
    revenueByCategory = [],
    monthlyRevenue = [],
    topProducts = [],
  } = data || {}


  // Format currency helpers
  const formatCurrency = (val) => `$${Number(val).toFixed(2)}`

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Revenue Trend (Last 30 Days) */}
      <div className="flex flex-col rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-amber-900/5 hover:border-amber-200 dark:hover:border-zinc-700 transition-all">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--bakery-text)]">
              <TrendingUp size={16} className="text-amber-600 dark:text-amber-500" />
              Daily Revenue Trend
            </h3>
            <p className="text-xs text-[var(--bakery-text-muted)]">Net revenue over the last 30 days</p>
          </div>
        </div>
        <div className="w-full">
          {revenueByDay.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-40" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Orders Volume & Status (Last 30 Days) */}
      <div className="flex flex-col rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-amber-900/5 hover:border-amber-200 dark:hover:border-zinc-700 transition-all">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--bakery-text)]">
              <ShoppingBag size={16} className="text-amber-600 dark:text-amber-500" />
              Orders Volume by Status
            </h3>
            <p className="text-xs text-[var(--bakery-text-muted)]">Daily order count and status breakdown</p>
          </div>
        </div>
        <div className="w-full">
          {ordersByDay.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ordersByDay} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-40" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="delivered" name="Delivered" stackId="status" fill={STATUS_COLORS.delivered} radius={[0, 0, 0, 0]} />
                <Bar dataKey="ready" name="Ready" stackId="status" fill={STATUS_COLORS.ready} radius={[0, 0, 0, 0]} />
                <Bar dataKey="processing" name="Processing" stackId="status" fill={STATUS_COLORS.processing} radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending" stackId="status" fill={STATUS_COLORS.pending} radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" stackId="status" fill={STATUS_COLORS.cancelled} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Sales share by Category (Pie Chart) */}
      <div className="flex flex-col rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-amber-900/5 hover:border-amber-200 dark:hover:border-zinc-700 transition-all">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--bakery-text)]">
            <Tag size={16} className="text-amber-600 dark:text-amber-500" />
            Revenue by Category
          </h3>
          <p className="text-xs text-[var(--bakery-text-muted)]">Share of total sales across categories</p>
        </div>
        <div className="w-full">
          {revenueByCategory.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="revenue"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px' }}
                  payload={revenueByCategory.map((entry, index) => ({
                    value: entry.name,
                    type: 'circle',
                    id: entry.name,
                    color: COLORS[index % COLORS.length]
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Top Selling Products (Horizontal Bar Chart) */}
      <div className="flex flex-col rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-amber-900/5 hover:border-amber-200 dark:hover:border-zinc-700 transition-all">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--bakery-text)]">
            <Award size={16} className="text-amber-600 dark:text-amber-500" />
            Top 5 Products
          </h3>
          <p className="text-xs text-[var(--bakery-text-muted)]">Best sellers by unit quantity sold</p>
        </div>
        <div className="w-full">
          {topProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" className="opacity-40" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', width: 80 }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value, name) => [value, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                />
                <Bar dataKey="quantity" name="Quantity Sold" fill="#D97706" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <p className="text-xs font-bold text-[var(--bakery-text-muted)] opacity-60">No data available for this range</p>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex h-[360px] flex-col rounded-3xl border border-amber-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-amber-900/5 animate-pulse"
        >
          <div className="h-4 w-32 rounded bg-amber-100/70 dark:bg-zinc-800" />
          <div className="mt-2 h-3 w-48 rounded bg-amber-100/50 dark:bg-zinc-800/80" />
          <div className="mt-8 flex-1 rounded-2xl bg-amber-50/50 dark:bg-zinc-800/40" />
        </div>
      ))}
    </div>
  )
}
