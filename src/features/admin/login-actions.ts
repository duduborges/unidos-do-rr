'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { error: string | null }

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'E-mail ou senha inválidos.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) return { error: 'E-mail ou senha inválidos.' }

  const { data: admin } = await supabase
    .from('app_admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (!admin) {
    await supabase.auth.signOut()
    return { error: 'E-mail ou senha inválidos.' }
  }

  redirect('/admin')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
