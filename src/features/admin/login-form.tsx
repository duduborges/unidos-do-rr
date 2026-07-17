'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, LockKeyhole, Mail } from 'lucide-react'
import { useActionState } from 'react'
import { loginAction, type LoginState } from './login-actions'
import './admin.css'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return <main className="login-page">
    <div className="login-stripe" />
    <section className="login-panel">
      <Link href="/" className="login-brand">
        <Image src="/brand/unidos-logo.png" alt="Unidos do RR" width={86} height={98} />
        <span><strong>UNIDOS DO RR</strong><small>PAINEL ADMINISTRATIVO</small></span>
      </Link>
      <div className="login-copy"><span>ACESSO RESTRITO</span><h1>ENTRAR</h1><p>Gerencie partidas, atletas e o placar ao vivo.</p></div>
      <form action={action}>
        <label htmlFor="email">E-MAIL</label>
        <div className="login-input"><Mail /><input id="email" name="email" type="email" autoComplete="email" placeholder="seu@email.com" required /></div>
        <label htmlFor="password">SENHA</label>
        <div className="login-input"><LockKeyhole /><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Sua senha" minLength={8} required /><Eye /></div>
        {state.error && <p className="login-error" role="alert">{state.error}</p>}
        <button disabled={pending}>{pending ? 'ENTRANDO...' : 'ENTRAR NO PAINEL'}</button>
      </form>
      <Link className="back-site" href="/">← Voltar para o site</Link>
    </section>
    <aside className="login-visual"><div><span>UNIDOS PELO BAIRRO.</span><p>Rio Vermelho · Florianópolis</p></div></aside>
  </main>
}
