import { getHomeData } from '@/features/public-site/queries'

export default async function Home() {
  await getHomeData()

  return <h1>Unidos do RR</h1>
}
