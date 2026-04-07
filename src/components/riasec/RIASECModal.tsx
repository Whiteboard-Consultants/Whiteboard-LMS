/**
 * RIASEC Modal Component
 * Renders the assessment in a modal dialog
 */

'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RIASECAssessment } from './RIASECAssessment';

interface RIASECModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RIASECModal({ isOpen, onClose }: RIASECModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden w-full max-w-4xl relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition z-50 flex items-center justify-center bg-white shadow-md hover:shadow-lg group"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          </button>

          {/* Content */}
          <div className="overflow-y-auto max-h-[90vh]">
            <RIASECAssessment />
          </div>
        </div>
      </div>
    </>
  );
}
