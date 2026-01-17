'use client';

import TemplateMarketplace from '@/components/premium/TemplateMarketplace';

export default function TemplatesPage() {
    return (
        <div className="min-h-screen">
            <TemplateMarketplace />
            
            <footer className="border-t py-12 bg-muted/50">
                <div className="container">
                    <div className="text-center text-sm text-muted-foreground">
                        <p className="mb-2">© 2024 dApp Factory. All rights reserved.</p>
                        <p className="mb-4">Built with AI on Solana</p>
                        <div className="flex justify-center gap-6 text-xs">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
