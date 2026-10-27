import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: 'Team Kabirians Taekwondo',
  description: 'Team Kabirians Taekwondo, proudly associated with Pakistan Taekwondo Lovers. Explore the team archive, public events, and published results.',
};

export default function HomePage() {
  return <HomePageClient />;
}
