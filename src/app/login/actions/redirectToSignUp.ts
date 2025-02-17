'use server'
import { redirect } from 'next/navigation'

const redirectToSignUp = async () => {
  redirect('/sign-up')
}

export default redirectToSignUp
