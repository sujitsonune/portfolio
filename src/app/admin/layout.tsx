import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Portfolio content management system',
  robots: {
    index: false,
    follow: false,
  },
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}