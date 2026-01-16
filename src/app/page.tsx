import MasterHero from '@/components/premium/MasterHero';
import SecurityPulse from '@/components/premium/SecurityPulse';
import HowItWorks from '@/components/premium/HowItWorks';
import PricingTiers from '@/components/premium/PricingTiers';
import SynthesisPreview from '@/components/premium/SynthesisPreview';
import AgentTerminal from '@/components/premium/AgentTerminal';
import MarketDynamics from '@/components/premium/MarketDynamics';
import TokenomicsDashboard from '@/components/premium/TokenomicsDashboard';
import RoadmapGalaxy from '@/components/premium/RoadmapGalaxy';

export default function Home() {
  return (
    <div className="min-h-screen">
      <MasterHero />
      <SecurityPulse />
      <HowItWorks />
      <PricingTiers />
      <SynthesisPreview />
      <AgentTerminal />
      <MarketDynamics />
      <TokenomicsDashboard />
      <RoadmapGalaxy />

      <footer className="border-t py-12 bg-muted/50">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2024 dApp Factory. All rights reserved.</p>
            <p className="mb-4">Built with AI on Solana</p>
            <p className="max-w-2xl mx-auto text-xs opacity-70">
              Disclaimer: Optik provides software development scaffolds and templates.
              Generated code requires professional security review and testing before mainnet deployment.
              This service does not constitute financial, legal, or security advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
