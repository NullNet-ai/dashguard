'use client'

import Cookies from 'js-cookie'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { useSidebar } from '~/components/ui/sidebar'
import { api } from '~/trpc/react'


export default function SessionChecker() {
  const {
    setIsBannerPresent,
  } = useSidebar();
  const router = useRouter()
  const pathname = usePathname()
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const shouldShowBanner = timeLeft !== null && timeLeft <= 3600

  useEffect(() => {
    const shouldRender = shouldShowBanner
    setIsBannerPresent(shouldRender)

    const interval = setInterval(() => {
      setIsBannerPresent(shouldRender)
    }, 1000)

    return () => {
      clearInterval(interval)
      setIsBannerPresent(false)

    }
  }, [isSessionExpired, timeLeft])

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
    if (pathname === '/login') {
      setTimeLeft(null)
      setIsSessionExpired(false)
    }

    if (pathname === '/login' && sessionStorage.getItem('sessionExpired')) {
      setIsSessionExpired(true)
      sessionStorage.removeItem('sessionExpired')
    }
  }, [pathname])

  if (isSessionExpired) {
    return (
      <div
        className='bg-amber-200 text-black font-normal text-center p-2 fixed flex top-0 items-center justify-center md:gap-4 gap-2 transition-opacity duration-500 ease-in-out opacity-100 z-[200]'
      >
        <div className='md:text-md flex items-center gap-2 justify-center'>
          <span className='inline-block md:size-4 size-3 bg-destructive rounded-full' />
          <span>
            Your session has expired. Please log in.
          </span>
        </div>
      </div>
    )
  }

  if (shouldShowBanner) {
  return (
    <div
      className={`bg-amber-200 fixed top-0 z-[200] text-black p-1 font-normal text-center md:p-2 flex items-center justify-center md:gap-4 transition-transform duration-500 ease-in-out ${timeLeft !== null && timeLeft <= 3600 ? 'translate-y-full' : 'translate-y-0'} w-screen`}
    >
      <span className='size-[17px] bg-destructive rounded-full hidden md:block' />
      <span className='md:text-md'>
      <span className='size-3 bg-destructive rounded-full inline-flex md:hidden me-2' />
      {'Your session will expire in '}{formatTimeLeft(timeLeft)}.<span className='ms-1 hidden md:inline'>Please save your work or log out.</span> <br /><span className='ms-1 md:hidden'>Please save your work or log out.</span>
      </span>
    </div>
  )
  }

  return null
}