'use client';

import TemplateMarketplace from '@/components/premium/TemplateMarketplace';
import Navbar from '@/components/Navbar';
import Footer from '../../components/Footer';

export default function TemplatesPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <TemplateMarketplace />
            </main>
            <Footer />
        </div>
    );
}
