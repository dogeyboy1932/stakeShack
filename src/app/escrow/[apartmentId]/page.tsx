'use client';

import { EscrowOperations } from '@/components/solana/EscrowOperations';
import { GillEscrowOperations } from '@/components/solana/GillEscrowOperations';
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
  return <GillEscrowOperations apartmentId={apartmentId}/>;
} 