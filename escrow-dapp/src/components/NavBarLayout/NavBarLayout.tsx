import { PropsWithChildren, useState } from "react";
import { logout } from "@multiversx/sdk-dapp/utils/logout";
import { routeNames } from "../../routes";
import { useSetupInterceptors } from "../../hooks";
import { CenterLayout } from "../CenterLayout";
import { Loader } from "@multiversx/sdk-dapp/UI";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";
import { ESCROW_CONTRACT_ADDRESS } from "../../config";

export const NavBarLayout = ({ children }: PropsWithChildren) => {
  const { interceptorApplied } = useSetupInterceptors();
  const { address } = useGetAccountInfo();
  const [copied, setCopied] = useState(false);

  const logoutHandler = () => {
    logout(routeNames.unlock);
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  if (!interceptorApplied) {
    return (
      <CenterLayout>
        <Loader noText />
      </CenterLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d18]/90 backdrop-blur-2xl shadow-xl shadow-black/20">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 transition-all duration-300">
                <svg
                  className="w-6 h-6 text-slate-950"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.4}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    X<span className="text-cyan-400">-ESCROW</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                  MultiversX P2P Escrow Protocol
                </p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="#dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-sm shadow-cyan-500/10 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Dashboard
              </a>
              <a
                href="https://devnet-wallet.multiversx.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                Devnet Faucet
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://devnet-explorer.multiversx.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                Explorer
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </nav>
          </div>

          {/* Right Section: Status Pills & Logout */}
          <div className="flex items-center gap-3">
            {/* Network Pill */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-850 bg-slate-900/90 border border-slate-750 border-slate-800 text-xs shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-semibold hidden sm:inline">MultiversX</span>
              <span className="text-emerald-400 font-bold">Devnet</span>
            </div>

            {/* Address Pill with Copy */}
            {address && (
              <button
                onClick={copyAddress}
                type="button"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-xs font-mono text-slate-200 group"
                title="Click to copy full address"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-400 to-indigo-500 flex-shrink-0 shadow-sm"></div>
                <span className="font-semibold">{shortAddress}</span>
                <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {copied ? (
                    <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logoutHandler}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-rose-500/20"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {children}
      </main>

      {/* Premium Web3 Edge-to-Edge Footer */}
      <footer className="w-full mt-auto border-t border-slate-800/80 bg-[#060913] text-slate-400 py-10 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Col */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold">
              <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                X-ESCROW PROTOCOL
              </span>
              <p className="text-xs text-slate-500">
                Decentralized & Trustless Peer-to-Peer Smart Contracts on MultiversX
              </p>
            </div>
          </div>

          {/* Quick Info & Contract */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Contract:</span>
              <span className="font-mono text-slate-300">
                {ESCROW_CONTRACT_ADDRESS.substring(0, 8)}...{ESCROW_CONTRACT_ADDRESS.substring(ESCROW_CONTRACT_ADDRESS.length - 6)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>Framework:</span>
              <span className="text-slate-300 font-semibold">multiversx-sc 0.66.2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>VM:</span>
              <span className="text-slate-300 font-semibold">EI 1.5 WASM</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-500 text-center md:text-right">
            <span>© 2026 MultiversX Token Escrow DApp</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
