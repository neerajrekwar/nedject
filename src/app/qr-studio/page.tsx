'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QRStudioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#qr-studio');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center font-mono text-sm font-bold">
      Redirecting to 300 DPI QR Studio...
    </div>
  );
}
