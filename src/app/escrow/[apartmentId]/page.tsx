'use client';

import { CleanGillEscrowOperations } from '@/components/solana/CleanGillEscrowOperations';
import { useParams, useSearchParams } from 'next/navigation';

interface PageProps {
  params: Promise<{ apartmentId: string }>;
}

export default  function EscrowPage() {
  // const { apartmentId } = awai params;

  const params = useParams();
  // const searchParams = useSearchParams();
  const apartmentId = params.apartmentId as string;
  // const referrerPubkey = searchParams.get('referrer');
  // const approvedProfile = searchParams.get('approvedProfile');

  // return <EscrowOperations apartmentId={apartmentId}/>;
  return <CleanGillEscrowOperations apartmentId={apartmentId}/>;
} 