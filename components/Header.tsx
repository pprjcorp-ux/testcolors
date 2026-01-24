'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full py-6 px-4 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo with playful hover effect */}
        <Link href="/" className="flex items-center gap-3 z-10 group">
          <div className="relative">
            {/* Colorful dots behind logo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-coral via-sunny to-teal rounded-2xl opacity-75 blur group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 rounded-2xl bg-white dark:bg-charcoal flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <span className="font-display font-extrabold text-xl text-gradient-playful">A</span>
            </div>
          </div>
          <span className="text-2xl font-display font-bold text-charcoal dark:text-white group-hover:text-coral transition-colors">
            Aura<span className="text-coral">Cor</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/questionario"
            className="px-4 py-2 rounded-2xl text-slate dark:text-gray-300 hover:bg-coral/10 hover:text-coral transition-all font-medium"
          >
            Questionário
          </Link>
          <Link
            href="/analise-foto"
            className="px-4 py-2 rounded-2xl text-slate dark:text-gray-300 hover:bg-teal/10 hover:text-teal transition-all font-medium"
          >
            Análise com IA
          </Link>
          <div className="ml-2 p-1 rounded-xl bg-muted/50">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Menu Button and Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden z-10">
          <div className="p-1 rounded-xl bg-muted/50">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-muted/50 text-charcoal dark:text-gray-300 hover:bg-coral/10 hover:text-coral transition-all"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu - Playful style */}
        {isMenuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-card rounded-3xl shadow-playful md:hidden animate-pop-in z-50 overflow-hidden">
            {/* Decorative top bar */}
            <div className="h-1 bg-gradient-to-r from-coral via-sunny to-teal" />

            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/questionario"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl text-charcoal dark:text-gray-200 hover:bg-coral/10 hover:text-coral transition-all font-medium group"
              >
                <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold">Questionário</span>
                  <span className="text-sm text-slate">7 perguntas rápidas</span>
                </div>
              </Link>

              <Link
                href="/analise-foto"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl text-charcoal dark:text-gray-200 hover:bg-teal/10 hover:text-teal transition-all font-medium group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold">Análise com IA</span>
                  <span className="text-sm text-slate">Upload de foto</span>
                </div>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
