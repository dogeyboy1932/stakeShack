'use client';

import { CleanGillEscrowOperations } from '@/components/solana/CleanGillEscrowOperations';
import { useParams } from 'next/navigation';

interface PageProps {
  params: Promise<{ apartmentId: string }>;
}

export default  function EscrowPage() {
  const params = useParams();
  const apartmentId = params.apartmentId as string;

  // return <EscrowOperations apartmentId={apartmentId}/>;
  return <CleanGillEscrowOperations apartmentId={apartmentId}/>;
} 