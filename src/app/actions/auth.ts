'use server'

import { cookies } from 'next/headers'

export async function login(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    return { success: true }
  }
  
  return { success: false, error: 'Contraseña incorrecta' }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  return { success: true }
}

export async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}
