/**
 * RIASEC Button Component
 * Button to launch the career assessment
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { RIASECModal } from './RIASECModal';

interface RIASECButtonProps {
  autoOpen?: boolean;
}

export function RIASECButton({ autoOpen = false }: RIASECButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);

  useEffect(() => {
    if (autoOpen) {
      setIsModalOpen(true);
    }
  }, [autoOpen]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 hover:shadow-lg"
      >
        <Sparkles className="w-5 h-5" />
        Discover Your Career Path
      </button>

      <RIASECModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
