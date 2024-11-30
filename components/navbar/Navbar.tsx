'use client'

import { Github, Menu } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const firstName = session?.user?.name?.split(' ')[0] || 'Guest'

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Contact', href: '/contact' },
    { name: 'Help', href: '/help' },
  ]

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Github className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-2xl font-bold">GitChat</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-blue-500 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-700 h-10 w-20 rounded-md"></div>
            ) : !session ? (
              <Button
                onClick={() => signIn('google')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign in
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Welcome, {firstName}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                      <AvatarFallback className='text-blue-700 font-extrabold'>{firstName[0]}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onSelect={() => signOut()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-blue-500 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-700 h-10 w-20 rounded-md mx-4"></div>
            ) : !session ? (
              <div className="px-2">
                <Button
                  onClick={() => signIn('google')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign in
                </Button>
              </div>
            ) : (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                    <AvatarFallback>{firstName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none">
                    {session.user?.name}
                  </div>
                  <div className="text-sm font-medium leading-none text-gray-400">
                    {session.user?.email}
                  </div>
                </div>
                <Button
                  onClick={() => signOut()}
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white"
                >
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

