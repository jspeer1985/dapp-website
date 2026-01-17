'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentFlow from '@/components/factory/PaymentFlow';
import GenerationProgress from '@/components/factory/GenerationProgress';
import StarterGenerationForm from '@/components/factory/tier-forms/StarterGenerationForm';
import BuilderGenerationForm from '@/components/factory/tier-forms/BuilderGenerationForm';
import LaunchpadGenerationForm from '@/components/factory/tier-forms/LaunchpadGenerationForm';
import AgencyGenerationForm from '@/components/factory/tier-forms/AgencyGenerationForm';
import EnterpriseGenerationForm from '@/components/factory/tier-forms/EnterpriseGenerationForm';

interface ProjectFactoryProps {
  selectedTier?: string | null;
}

export default function ProjectFactory({ selectedTier }: ProjectFactoryProps = {}) {
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

  // Render the appropriate form based on the selected tier
  const renderTierForm = () => {
    switch (selectedTier) {
      case 'starter':
      case 'development-starter':
        return <StarterGenerationForm onComplete={handleFormComplete} selectedTier={selectedTier} />;
      
      case 'builder':
      case 'professional':
      case 'professional-stack':
        return <BuilderGenerationForm onComplete={handleFormComplete} selectedTier={selectedTier} />;
      
      case 'launchpad':
        return <LaunchpadGenerationForm onComplete={handleFormComplete} selectedTier={selectedTier} />;
      
      case 'agency':
      case 'enterprise-foundation':
        return <AgencyGenerationForm onComplete={handleFormComplete} selectedTier={selectedTier} />;
      
      case 'enterprise':
        return <EnterpriseGenerationForm onComplete={handleFormComplete} selectedTier={selectedTier} />;
      
      default:
        // Default to Builder form if no tier is specified
        return <BuilderGenerationForm onComplete={handleFormComplete} selectedTier={selectedTier} />;
    }
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
        {renderTierForm()}
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
