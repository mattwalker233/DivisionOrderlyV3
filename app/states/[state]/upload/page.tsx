'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStateNameByCode } from '@/lib/state-data';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function StateUploadPage() {
  const params = useParams();
  const router = useRouter();
  const stateCode = (params.state as string).toUpperCase();
  const stateName = getStateNameByCode(stateCode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('state', stateCode);

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const data = await response.json();
      router.push(`/states/${params.state}/companies`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" size="sm" className="mr-4">
          <Link href={`/states/${params.state}/companies`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Division Order - {stateName}</CardTitle>
          <CardDescription>Upload a division order document for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="block p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground block">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground block">
                  PDF or TXT files supported
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt"
                  onChange={handleFileSelect}
                />
              </label>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Upload and Process'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 