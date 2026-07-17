import { emptyHomeData } from '@/features/public-site/demo-data'
import { HomePage } from '@/features/public-site/home-page'
import { getHomeData } from '@/features/public-site/queries'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let data = emptyHomeData
  try {
    data = await getHomeData()
  } catch {
    // The public site remains available with an explicit empty state.
  }
  return <HomePage data={data} />
}
