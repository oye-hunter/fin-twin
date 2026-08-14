'use client';

import React from 'react';
import { LandingNav } from './landing-nav';
import { AnimatedHero } from './animated-hero';
import { ComparisonSection } from './comparison-section';
import { FeaturesGrid } from './features-grid';
import { InteractiveDemo } from './interactive-demo';
import { FAQSection } from './faq-section';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col justify-between selection:bg-honey/40">
      <div>
        {/* Top Floating Nav with Dynamic Go to Dashboard / Sign In */}
        <LandingNav />

        {/* Hero Section with GSAP Animations & Real-Time Simulation */}
        <div id="how-it-works">
          <AnimatedHero />
        </div>

        {/* Why Fin-Twin / Problem vs Solution Comparison */}
        <ComparisonSection />

        {/* Core Features Grid */}
        <FeaturesGrid />

        {/* Interactive Live Testing Widget */}
        <InteractiveDemo />

        {/* Frequently Asked Questions & Final CTA */}
        <FAQSection />
      </div>

      {/* Public Footer */}
      <footer className="w-full max-w-[1140px] mx-auto px-6 py-10 text-center text-xs text-ink/40 border-t border-ink/8 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-ink/60 font-medium">
          <a href="#how-it-works" className="hover:text-ink">
            How It Works
          </a>
          <a href="#problems" className="hover:text-ink">
            Why Fin-Twin
          </a>
          <a href="#features" className="hover:text-ink">
            Features
          </a>
          <a href="#demo" className="hover:text-ink">
            Interactive Demo
          </a>
          <a href="#faq" className="hover:text-ink">
            FAQ
          </a>
        </div>
        <p className="pt-2">
          Fin-Twin &copy; {new Date().getFullYear()} &middot; Personal Financial Twin &middot; Zelt Warm Editorial Design System
        </p>
      </footer>
    </div>
  );
}
