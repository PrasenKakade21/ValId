'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
  Download,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

export default function WelcomeHome() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-neutral-800 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Background Radial Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Subtle Glow Backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-neutral-800/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-neutral-900 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800">
              <Shield className="w-4 h-4 text-neutral-200" />
            </div>
            <span className="font-semibold text-xs tracking-widest uppercase text-neutral-200">
              VAL<span className="text-neutral-500">ID</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-neutral-800 bg-neutral-950 text-neutral-400 font-mono text-[10px] gap-1.5 py-1 px-2.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v1.0 Personal
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center items-center text-center">
        {/* Intro Badge */}
        <Badge
          variant="secondary"
          className="bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-900 px-3.5 py-1 text-xs mb-8 rounded-full flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span>Personal Credential Utility Engine</span>
        </Badge>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1] mb-6">
          Generate digital IDs with precision and ease.
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          A minimal workspace designed to render vector-sharp, customizable digital identity cards and credentials instantly in your browser.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Button
            
            size="lg"
            className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 font-medium px-8 transition-all active:scale-[0.98]"
          >
            <Link href="/dashboard/generator" className="flex items-center gap-2">
              Launch Generator <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6"
          >
            <a href="#features" className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neutral-500" /> System Specs
            </a>
          </Button>
        </div>

        {/* Core Specs / Feature Cards */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left pt-6">
          <Card className="bg-neutral-950 border-neutral-900 text-neutral-200 shadow-xl">
            <CardContent className="p-6 space-y-3">
              <div className="p-2.5 w-fit bg-neutral-900 rounded-lg border border-neutral-800">
                <Zap className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="font-semibold text-sm text-white">Real-Time Render</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Live feedback engine updates parameters instantly as you input card attributes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-neutral-900 text-neutral-200 shadow-xl">
            <CardContent className="p-6 space-y-3">
              <div className="p-2.5 w-fit bg-neutral-900 rounded-lg border border-neutral-800">
                <Lock className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="font-semibold text-sm text-white">Client-Side Private</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Zero data storage. Identity parameters and uploaded graphics remain inside your local runtime.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-950 border-neutral-900 text-neutral-200 shadow-xl">
            <CardContent className="p-6 space-y-3">
              <div className="p-2.5 w-fit bg-neutral-900 rounded-lg border border-neutral-800">
                <Download className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="font-semibold text-sm text-white">Vector Export</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Export high-resolution pass assets in standard CR-80 physical dimensions ready for print.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 bg-black/80 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
            Engine Operational
          </div>
          <p className="text-xs text-neutral-600 font-mono">
            Personal Identity Engine &bull; Built with Next.js & shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}