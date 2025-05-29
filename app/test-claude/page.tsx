'use client';

import { useState } from 'react';
import { processDocument } from '@/lib/document-processor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { stateData, type Company } from '@/lib/state-data';
import { useRouter } from 'next/navigation';

interface ExtractionResult {
  wellName: string;
  operator: string;
  county: string;
  royaltyInterest: number;
  tractAcres: number;
  ownerName: string;
  effectiveDate: string;
  propertyDescription?: string;
  preparedDate?: string;
}

export default function TestClaudePage() {
  const router = useRouter();
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [editedResult, setEditedResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  const companies = selectedState 
    ? stateData.find(state => state.code === selectedState)?.companies || []
    : [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedState) {
      setError('Please select a state before uploading');
      return;
    }
    if (!selectedCompany) {
      setError('Please select a company before uploading');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setEditedResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const data = await response.json();
      setResult(data);
      setEditedResult(data);
      console.log('Extraction Results:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ExtractionResult, value: string) => {
    if (!editedResult) return;
    
    let processedValue: string | number = value;
    
    // Convert numeric fields
    if (field === 'royaltyInterest' || field === 'tractAcres') {
      processedValue = parseFloat(value) || 0;
    }

    setEditedResult({
      ...editedResult,
      [field]: processedValue
    });
  };

  const handleSubmit = async () => {
    if (!editedResult || !selectedState || !selectedCompany) return;
    
    try {
      // After successful processing, redirect to the company page
      router.push(`/states/${selectedState}/companies/${selectedCompany}`);
    } catch (err) {
      setError('Failed to save to database');
      console.error('Database error:', err);
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCompany('');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Division Order Processing</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="state">Select State</Label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {stateData.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div className="space-y-2">
                <Label htmlFor="company">Select Company</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">Upload Division Order</Label>
              <input
                id="file"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
            </div>

            {loading && <p className="text-blue-600">Processing document...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        </CardContent>
      </Card>

      {editedResult && (
        <Card>
          <CardHeader>
            <CardTitle>Review and Edit Extraction Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wellName">Well Name</Label>
                  <Input
                    id="wellName"
                    value={editedResult.wellName}
                    onChange={(e) => handleInputChange('wellName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator">Operator</Label>
                  <Input
                    id="operator"
                    value={editedResult.operator}
                    onChange={(e) => handleInputChange('operator', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={editedResult.county}
                    onChange={(e) => handleInputChange('county', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royaltyInterest">Royalty Interest</Label>
                  <Input
                    id="royaltyInterest"
                    type="number"
                    step="0.000001"
                    value={editedResult.royaltyInterest}
                    onChange={(e) => handleInputChange('royaltyInterest', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tractAcres">Tract Acres</Label>
                  <Input
                    id="tractAcres"
                    type="number"
                    step="0.01"
                    value={editedResult.tractAcres}
                    onChange={(e) => handleInputChange('tractAcres', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={editedResult.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={editedResult.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyDescription">Property Description</Label>
                  <Input
                    id="propertyDescription"
                    value={editedResult.propertyDescription || ''}
                    onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={() => setEditedResult(result)}>
                  Reset Changes
                </Button>
                <Button onClick={handleSubmit}>
                  Save and Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 