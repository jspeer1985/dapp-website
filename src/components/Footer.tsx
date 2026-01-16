import Link from 'next/link';
import { Twitter, Github, Globe, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative border-t border-border/40 bg-background/95 backdrop-blur-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            
            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-gradient">
                                Optik
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                                The next-generation dApp factory. Build, deploy, and scale your Web3 vision in minutes with professional-grade tools.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Link 
                                href="#" 
                                className="group relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-all duration-200 hover:scale-105"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>
                            <Link 
                                href="#" 
                                className="group relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-all duration-200 hover:scale-105"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>
                            <Link 
                                href="#" 
                                className="group relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-all duration-200 hover:scale-105"
                                aria-label="Website"
                            >
                                <Globe className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Product Section */}
                    <div className="space-y-6">
                        <h4 className="font-semibold text-foreground text-lg">Product</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link 
                                    href="/factory" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group"
                                >
                                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
                                    <span className="ml-2">Create dApp</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/templates" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group"
                                >
                                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
                                    <span className="ml-2">Templates</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group"
                                >
                                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
                                    <span className="ml-2">Features</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="space-y-6">
                        <h4 className="font-semibold text-foreground text-lg">Support</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link 
                                    href="/terms" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group"
                                >
                                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
                                    <span className="ml-2">Terms of Service</span>
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="mailto:support@optikecosystem.com" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group"
                                >
                                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
                                    <span className="ml-2">Contact Support</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Back to Top */}
                    <div className="space-y-6">
                        <h4 className="font-semibold text-foreground text-lg">Quick Actions</h4>
                        <Button 
                            onClick={scrollToTop}
                            variant="outline" 
                            className="w-full group hover:border-primary/50 transition-all duration-200"
                        >
                            <ArrowUp className="w-4 h-4 mr-2 transform group-hover:-translate-y-1 transition-transform duration-200" />
                            Back to Top
                        </Button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-border/40">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {currentYear} Optik Platform. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>Built with</span>
                            <span className="text-primary font-semibold">❤️</span>
                            <span>on Solana</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
