'use client';

import { useState } from 'react';
import ZelleInstructions from '@/components/ZelleInstructions';

export default function DemoPage() {
  const [view, setView] = useState<'zelle' | 'receipt'>('zelle');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">Phase 2 Demo: Deposit System</h1>
          <p className="text-gray-600 mb-4">
            This page demonstrates the Phase 2 features without requiring Supabase configuration.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setView('zelle')}
              className={`px-4 py-2 rounded ${
                view === 'zelle' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Zelle Instructions
            </button>
            <button
              onClick={() => setView('receipt')}
              className={`px-4 py-2 rounded ${
                view === 'receipt' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Receipt Upload UI
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {view === 'zelle' && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Step 2 of booking flow:</strong> After filling the booking form, 
                  clients see Zelle payment instructions with QR code.
                </p>
              </div>
              <ZelleInstructions 
                zelleEmail="stylist@example.com"
                zellePhone="555-123-4567"
                amount={50}
              />
            </div>
          )}

          {view === 'receipt' && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Step 3 of booking flow:</strong> Clients upload their payment 
                  receipt screenshot using drag-and-drop functionality.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Upload Payment Receipt</h2>
                  <p className="text-gray-600">
                    Upload a screenshot or photo of your Zelle payment confirmation
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
                  <svg className="mx-auto text-gray-400 mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium mb-2">
                        Drag & drop your receipt here
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to select a file
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Accepted formats: PNG, JPG, JPEG, GIF, WebP
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">What happens next?</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                    <li>Our team will verify your payment within 24 hours</li>
                    <li>You'll receive a confirmation email once approved</li>
                    <li>Your appointment will be officially confirmed</li>
                    <li>We'll send you a reminder before your appointment</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
