'use client'
import { Github } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] || 'Guest';
  return (
    <div className='flex justify-between items-center text-lg p-4 bg-gray-800 text-white shadow-lg'>
  
     <Link href='/'>
     <div className='font-bold text-2xl flex'>
      <Github className="w-10 h-10 mx-1" /> GitChat
      </div>

     </Link>
      <div className='hidden md:flex space-x-6'>
        <ul className='flex space-x-16'>
          <li className='hover:text-green-400 cursor-pointer'>Home</li>
          <li className='hover:text-green-400 cursor-pointer'>Contact</li>
          <li className='hover:text-green-400 cursor-pointer'>Help</li>
        </ul>
      </div>

      <div className='flex items-center space-x-4'>
        {!session ? (
          <button
            className='bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none'
            onClick={() => signIn('google')}
          >
            Sign in
          </button>
        ) : (
          <div className='flex items-center space-x-4'>
             {session.user?.image && (
              <Image
                className='rounded-full'
                src={session.user?.image || ''}
                height={40}
                width={40}
                alt='User Profile Image'
              />
            )}
            <p className='text-md text-gray-300'>Welcome, {firstName}</p>
        

        
            <button
              className='bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none'
              onClick={() => signOut()}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
