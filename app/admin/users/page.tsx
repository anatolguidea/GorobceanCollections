import { Metadata } from 'next'
import AdminUsersClient from '@/components/AdminUsersClient'

export const metadata: Metadata = {
  title: 'Users Management | Admin Dashboard | Gorobcean Collections',
  description: 'Manage user accounts, roles, and permissions in the admin dashboard.',
  keywords: 'admin, users, management, roles, permissions',
  authors: [{ name: 'Gorobcean Collections' }],
  openGraph: {
    title: 'Users Management | Admin Dashboard | Gorobcean Collections',
    description: 'Manage user accounts, roles, and permissions in the admin dashboard.',
    type: 'website',
  },
}

export default function AdminUsersPage() {
  return <AdminUsersClient />
}
