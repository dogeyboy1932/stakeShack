'use client';

import { EscrowOperations } from '@/components/solana/EscrowOperations';
import { useParams } from 'next/navigation';

interface PageProps {
  params: Promise<{ apartmentId: string }>;
}

export default  function EscrowPage() {
  // const { apartmentId } = awai params;

  const params = useParams();
  const apartmentId = params.apartmentId as string;

  return <EscrowOperations apartmentId={apartmentId} />;
} 