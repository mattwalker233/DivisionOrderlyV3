'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { DivisionOrder } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface DivisionOrderPreviewProps {
  order: DivisionOrder;
  onUpdate: (updatedOrder: DivisionOrder) => void;
}

export function DivisionOrderPreview({ order, onUpdate }: DivisionOrderPreviewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(order);

  const handleInputChange = (field: keyof DivisionOrder, value: string) => {
    setEditedOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWellChange = (wellIndex: number, field: string, value: string) => {
    setEditedOrder(prev => ({
      ...prev,
      wells: prev.wells.map((well, index) => 
        index === wellIndex 
          ? { ...well, [field]: field === 'decimalInterest' ? parseFloat(value) || 0 : value }
          : well
      )
    }));
  };

  const handleSave = () => {
    onUpdate(editedOrder);
    setIsEditing(false);
  };

  const handleDeploy = async () => {
    try {
      // TODO: Implement actual deployment logic
      const response = await fetch('/api/division-orders/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy division order');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deploying division order:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Division Order Preview</CardTitle>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? "Save Changes" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Common Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="operator">Operator</Label>
            <Input
              id="operator"
              value={editedOrder.operator}
              onChange={(e) => handleInputChange('operator', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entity">Entity</Label>
            <Input
              id="entity"
              value={editedOrder.entity}
              onChange={(e) => handleInputChange('entity', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={editedOrder.effectiveDate.split('T')[0]}
              onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              value={editedOrder.county}
              onChange={(e) => handleInputChange('county', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Wells */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Wells</h3>
          {editedOrder.wells.map((well, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`well-${index}-name`}>Well/Property Name</Label>
                  <Input
                    id={`well-${index}-name`}
                    value={well.wellName}
                    onChange={(e) => handleWellChange(index, 'wellName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`well-${index}-description`}>Property Description</Label>
                  <Input
                    id={`well-${index}-description`}
                    value={well.propertyDescription}
                    onChange={(e) => handleWellChange(index, 'propertyDescription', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`well-${index}-interest`}>Royalty Interest</Label>
                  <Input
                    id={`well-${index}-interest`}
                    type="number"
                    step="0.000001"
                    value={well.decimalInterest}
                    onChange={(e) => handleWellChange(index, 'decimalInterest', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setIsEditing(false)}
          className={isEditing ? 'visible' : 'hidden'}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleDeploy}
          className="bg-green-600 hover:bg-green-700"
          disabled={isEditing}
        >
          Deploy to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
} 