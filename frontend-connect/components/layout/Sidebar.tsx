'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WalletIcon
} from '@heroicons/react/24/outline'
import AccountBadge from './AccountBadge'

const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
//   { name: 'Pets', href: '/pets', icon: '🐾' },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  { name: 'Connect', href: '/connect', icon: '🔗' },
  { name: 'Payouts', href: '/payouts', icon: BanknotesIcon },
//   { name: 'Finances', href: '/finances', icon: ChartBarIcon },
  { name: 'My account', href: '/account', icon: Cog6ToothIcon },
] as const

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Furever</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const isStringIcon = typeof item.icon === 'string'

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isStringIcon ? (
                    <span className="text-xl">{item.icon}</span>
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Account Badge at Bottom */}
      <div className="p-4 border-t border-gray-200">
        <AccountBadge />
      </div>
    </aside>
  )
}