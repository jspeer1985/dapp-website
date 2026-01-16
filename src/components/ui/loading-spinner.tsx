'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Loader2 className={`${sizeClasses[size]} text-primary`} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="card-elevated p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="loading-skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="loading-skeleton h-4 w-3/4 rounded" />
          <div className="loading-skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="loading-skeleton h-3 w-full rounded" />
        <div className="loading-skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}

export function LoadingButton({ text = 'Loading...' }: { text?: string }) {
  return (
    <motion.button
      disabled
      className="button-primary w-full cursor-not-allowed opacity-75"
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 0.75 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <LoadingSpinner size="sm" text={text} />
    </motion.button>
  );
}
