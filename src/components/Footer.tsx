import Link from 'next/link';
import { Twitter, Github, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Optik
                    </h3>
                    <p className="text-gray-400 text-sm">
                        The next-generation dApp factory. Build, deploy, and scale your Web3 vision in minutes.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Github className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Globe className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/factory" className="hover:text-purple-400 transition-colors">Create dApp</Link></li>
                        <li><Link href="/templates" className="hover:text-purple-400 transition-colors">Templates</Link></li>
                        <li><Link href="/" className="hover:text-purple-400 transition-colors">Features</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                        <li><a href="mailto:support@optikecosystem.com" className="hover:text-purple-400 transition-colors">Contact Support</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Optik Platform. All rights reserved.
            </div>
        </footer>
    );
}
