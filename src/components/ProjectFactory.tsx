'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectForm from '@/components/factory/ProjectForm';
import PaymentFlow from '@/components/factory/PaymentFlow';
import GenerationProgress from '@/components/factory/GenerationProgress';

export default function ProjectFactory() {
  const [activeTab, setActiveTab] = useState('form');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const handleFormComplete = (id: string, amount: number) => {
    setGenerationId(id);
    setPaymentAmount(amount);
    setActiveTab('payment');
  };

  const handlePaymentComplete = () => {
    setActiveTab('progress');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="form" disabled={activeTab !== 'form'}>
          1. Details
        </TabsTrigger>
        <TabsTrigger value="payment" disabled={activeTab !== 'payment' && activeTab !== 'progress'}>
          2. Payment
        </TabsTrigger>
        <TabsTrigger value="progress" disabled={activeTab !== 'progress'}>
          3. Generate
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="mt-6">
        <ProjectForm onComplete={handleFormComplete} />
      </TabsContent>

      <TabsContent value="payment" className="mt-6">
        {generationId && (
          <PaymentFlow
            generationId={generationId}
            amount={paymentAmount}
            onComplete={handlePaymentComplete}
          />
        )}
      </TabsContent>

      <TabsContent value="progress" className="mt-6">
        {generationId && <GenerationProgress generationId={generationId} />}
      </TabsContent>
    </Tabs>
  );
}
