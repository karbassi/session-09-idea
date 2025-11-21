'use client';

import { useState } from 'react';
import BookingForm from '@/components/BookingForm';
import ZelleInstructions from '@/components/ZelleInstructions';
import ReceiptUpload from '@/components/ReceiptUpload';
import { CheckCircle } from 'lucide-react';

type Step = 'form' | 'payment' | 'receipt' | 'confirmation';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [bookingId, setBookingId] = useState<string>('');

  const handleBookingSuccess = (id: string) => {
    setBookingId(id);
    setCurrentStep('payment');
  };

  const handlePaymentContinue = () => {
    setCurrentStep('receipt');
  };

  const handleReceiptSuccess = () => {
    setCurrentStep('confirmation');
  };

  const steps = [
    { id: 'form', label: 'Booking Details' },
    { id: 'payment', label: 'Payment' },
    { id: 'receipt', label: 'Upload Receipt' },
    { id: 'confirmation', label: 'Confirmation' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${index <= currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                      }
                    `}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle size={20} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      h-1 flex-1 mx-2
                      ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 'form' && (
            <BookingForm onSuccess={handleBookingSuccess} />
          )}

          {currentStep === 'payment' && (
            <div className="space-y-6">
              <ZelleInstructions />
              <div className="text-center">
                <button
                  onClick={handlePaymentContinue}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  I've Sent the Payment →
                </button>
              </div>
            </div>
          )}

          {currentStep === 'receipt' && (
            <ReceiptUpload
              bookingId={bookingId}
              onSuccess={handleReceiptSuccess}
            />
          )}

          {currentStep === 'confirmation' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <CheckCircle className="mx-auto text-green-500" size={64} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Booking Submitted!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your booking. We've received your payment receipt
                and will review it shortly.
              </p>
              <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-2">Booking Reference:</h3>
                <p className="text-sm font-mono break-all">{bookingId}</p>
              </div>
              <p className="text-gray-600 mb-8">
                You'll receive a confirmation email once your payment is verified
                (usually within 24 hours).
              </p>
              <a
                href="/"
                className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Return to Home
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
