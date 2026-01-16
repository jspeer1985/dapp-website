'use client';

import TemplateMarketplace from '@/components/templates/TemplateMarketplace';
import Navbar from '@/components/Navbar';
import Footer from '../../components/Footer';

export default function TemplatesPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] overflow-hidden">
            <Navbar />
            <main className="pt-24 pb-20">
                <TemplateMarketplace />
            </main>
            <Footer />

            {/* Ambient background glow */}
            <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-20 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />
        </div>
    );
}
