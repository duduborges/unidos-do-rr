import { AdminApp } from '@/features/admin/admin-app'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()
  return <AdminApp />
}
