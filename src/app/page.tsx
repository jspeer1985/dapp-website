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
            <p>Built with AI on Solana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
