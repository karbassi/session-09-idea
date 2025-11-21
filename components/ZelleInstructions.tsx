'use client';

import { QRCodeSVG } from 'qrcode.react';

interface ZelleInstructionsProps {
  zelleEmail?: string;
  zellePhone?: string;
  amount?: number;
}

export default function ZelleInstructions({
  zelleEmail = 'stylist@example.com',
  zellePhone = '555-123-4567',
  amount = 50,
}: ZelleInstructionsProps) {
  // Format Zelle payment URL - this is a simplified version
  // In production, you'd use the actual Zelle deep link format
  const zelleUrl = `https://enroll.zellepay.com/qr-codes?data=${encodeURIComponent(
    JSON.stringify({
      token: zelleEmail,
      amount: amount.toString(),
    })
  )}`;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Complete Your Deposit Payment
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-center text-gray-700">
          Please send a deposit of <span className="font-bold text-xl">${amount}</span> via Zelle to secure your booking.
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Payment Instructions</h3>
          
          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
              <QRCodeSVG
                value={zelleUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your Zelle app
          </p>
          
          <div className="border-t border-gray-200 my-6"></div>
          
          <p className="text-sm text-gray-600 mb-2">Or manually send to:</p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Zelle Email:</p>
            <p className="font-semibold text-lg">{zelleEmail}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Zelle Phone:</p>
            <p className="font-semibold text-lg">{zellePhone}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Amount:</p>
            <p className="font-semibold text-lg">${amount}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <span className="mr-2">⚠️</span> Important:
          </h4>
          <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
            <li>Make sure to send the exact amount: ${amount}</li>
            <li>After payment, take a screenshot of the confirmation</li>
            <li>Upload the screenshot on the next page</li>
            <li>Your booking will be confirmed once payment is verified</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
