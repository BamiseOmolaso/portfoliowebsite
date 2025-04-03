import { checkAuth } from '@/lib/auth';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  await checkAuth();
  return <DashboardContent />;
}
