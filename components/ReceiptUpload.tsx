'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

interface ReceiptUploadProps {
  bookingId: string;
  onSuccess?: () => void;
}

export default function ReceiptUpload({ bookingId, onSuccess }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview and clean up previous one
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    setError('');
    setUploadSuccess(false);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Update booking with receipt URL
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ deposit_receipt_url: publicUrl })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setUploadSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [bookingId, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading || uploadSuccess,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Upload Payment Receipt</h2>
        <p className="text-gray-600">
          Upload a screenshot or photo of your Zelle payment confirmation
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <XCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
          <span className="text-green-700">
            Receipt uploaded successfully! Your booking is pending approval.
          </span>
        </div>
      )}

      {!uploadSuccess && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              {uploading && (
                <p className="text-gray-600">Uploading...</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto text-gray-400" size={48} />
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive
                    ? 'Drop your receipt here'
                    : 'Drag & drop your receipt here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to select a file
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Accepted formats: PNG, JPG, JPEG, GIF, WebP
              </p>
            </div>
          )}
        </div>
      )}

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
  );
}
