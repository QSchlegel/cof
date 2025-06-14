'use client';

import Link from "next/link";
import { Logo } from "@/components/logo";
import ConnectWallet from "@/components/connect-wallet";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <Logo />
              <div>
                <h1 className="text-xl font-bold text-slate-900">COF</h1>
                <p className="text-xs text-slate-500">Cardano Open Funding</p>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/"
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Discover
              </Link>
              <Link 
                href="/donors"
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Donors
              </Link>
              <Link 
                href="/maintainers"
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Maintainers
              </Link>
              <Link 
                href="/#transparency"
                className="text-slate-600 hover:text-cardano-600 transition-colors"
              >
                Transparency
              </Link>
            </nav>
          </div>

          <ConnectWallet />
        </div>
      </div>
    </header>
  );
} 