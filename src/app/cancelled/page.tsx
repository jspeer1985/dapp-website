'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CancelledPage() {
    const searchParams = useSearchParams();
    const jobId = searchParams.get('job_id');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-xl w-full border border-white/20 text-center"
            >
                <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">Payment Cancelled</h1>
                <p className="text-xl text-gray-300 mb-8">
                    The payment process was interrupted. No charges were made to your account.
                </p>

                {jobId && (
                    <div className="bg-black/30 rounded-xl p-4 mb-8 text-sm text-gray-400">
                        Reference ID: <span className="font-mono text-white">{jobId}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/factory">
                        <Button size="lg" className="w-full sm:w-auto gap-2">
                            <RefreshCcw className="w-5 h-5" />
                            Try Again
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <p className="text-gray-500 mt-12 text-sm italic">
                    If you encountered a technical issue, please reach out to support@optikecosystem.com
                </p>
            </motion.div>
        </div>
    );
}
