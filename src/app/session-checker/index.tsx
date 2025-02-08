'use client'

import Cookies from 'js-cookie'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { api } from '~/trpc/react'

export default function SessionChecker() {
  const router = useRouter()
  const pathname = usePathname()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isSessionExpired, setIsSessionExpired] = useState(false)

  const formatTimeLeft = (seconds: number | null) => {
    if (seconds === null) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return (
      <Badge className='mx-0.5 border border-destructive bg-destructive/10 text-destructive py-0'>
        {hours}
        h
        {minutes}
        m
        {remainingSeconds}
        s
      </Badge>
    )
  }
  const apiAuth = api.auth.logout.useMutation()

  const handleLogout = async () => {
    await apiAuth.mutateAsync().then(() => {
      router.replace('/login')
      Cookies.remove('token')
      sessionStorage.setItem('sessionExpired', 'true')
    })
  }

  const handleSessionExpiration = async () => {
    setIsSessionExpired(true)
    await handleLogout()
  }

  useEffect(() => {
    const checkSession = async () => {
      const token = Cookies.get('token')

      if (token) {
        setIsSessionExpired(false)
      }

      if (!token) {
        setTimeLeft(null)
        return
      }

      try {
        const payload = JSON.parse(atob(token?.split('.')[1] || ''))
        const { exp } = payload
        const currentTime = Math.floor(Date.now() / 1000)
        const remainingTime = exp - currentTime

        if (!remainingTime) {
          setTimeLeft(null)
          return
        }
        if (remainingTime <= 0) {
          await handleSessionExpiration()
          return
        }

        setTimeLeft(remainingTime)
      }
      catch (error) {
        await handleSessionExpiration()
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(checkSession, 1000)
    checkSession().catch(console.error)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Reset both states when on login page
    if (pathname === '/login') {
      setTimeLeft(null)
      setIsSessionExpired(false)
    }

    // Only show expired message if we're on login page and have the flag
    if (pathname === '/login' && sessionStorage.getItem('sessionExpired')) {
      setIsSessionExpired(true)
      sessionStorage.removeItem('sessionExpired')
    }
  }, [pathname])

  if (isSessionExpired) {
    return (
      <div
        className='bg-yellow-200 text-black font-normal text-center p-1 fixed'
        style={{
          position: 'relative',
          zIndex: 9999,
        }}
      >
       <span className='size-4 bg-destructive rounded-full'></span> Your session has expired. Please log in.
      </div>
    )
  }

  if (timeLeft !== null) {
    return (
      <div
        className='bg-[#FBBF24] text-black font-normal text-center p-2 fixed flex items-center justify-center gap-4'
        style={{
          position: 'relative',
          zIndex: 9999,
        }}
      >
        <span className='inline-block w-4 h-4 bg-destructive rounded-full self-center'></span>
        <span className='text-md'>
          {'Your session will expire in '}
          {formatTimeLeft(timeLeft)}.<span className='ms-1'>Please save your work or log out.</span>   
        </span>
      </div>
    )
  }

  return null
}
