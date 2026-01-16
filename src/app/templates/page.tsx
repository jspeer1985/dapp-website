'use client';

import TemplateMarketplace from '@/components/premium/TemplateMarketplace';
import Footer from '../../components/Footer';

export default function TemplatesPage() {
    return (
        <div className="min-h-screen">
            <main>
                <TemplateMarketplace />
            </main>
            <Footer />
        </div>
    );
}
