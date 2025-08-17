import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts';
import { HomeScreen } from '@/src/screens';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show landing page if not authenticated and not loading
  if (!isLoading && !isAuthenticated) {
    return <HomeScreen />;
  }

  // Show loading or nothing while checking auth state
  return null;
}