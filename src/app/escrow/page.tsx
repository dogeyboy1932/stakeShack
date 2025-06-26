'use client';

import { ErrorState } from '@/components/ui/error-state';
import { useRouter } from 'next/navigation';

export default function EscrowPage() {
  const router = useRouter();

  return (
    <ErrorState 
      error="Nothing on this page"
      onRetry={() => router.push('/')}
      buttonName="Back To Home"
    />
  );
} 