'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Aplikacijos klaida:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oi! Kažkas nepavyko
        </h1>
        <p className="text-gray-600 mb-6">
          Apgailestaujame, bet įvyko nenumatyta klaida. Pabandykite iš naujo.
        </p>
        <Button
          onClick={reset}
          variant="primary"
        >
          Bandyti iš naujo
        </Button>
      </div>
    </div>
  );
}