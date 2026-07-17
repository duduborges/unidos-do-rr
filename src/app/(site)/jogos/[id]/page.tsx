import { notFound } from 'next/navigation'
import { MatchDetail } from '@/features/public-site/match-detail'
import { getMatchDetail } from '@/features/public-site/match-detail-query'

export const dynamic = 'force-dynamic'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getMatchDetail(id)
  if (!detail) notFound()
  return <MatchDetail data={detail} />
}
