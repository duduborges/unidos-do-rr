import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MatchNotFound() {
  return (
    <div className="detail-shell">
      <div className="detail-missing">
        <span>404</span>
        <h1>PARTIDA NÃO ENCONTRADA</h1>
        <p>Esta partida não existe ou foi removida.</p>
        <Link href="/"><ArrowLeft size={16} /> VOLTAR PARA A HOME</Link>
      </div>
    </div>
  )
}
