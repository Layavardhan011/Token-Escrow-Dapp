import { PropsWithChildren, useEffect, useState } from "react";
import { logout } from "@multiversx/sdk-dapp/utils/logout";
import { routeNames } from "../../routes";
import { useSetupInterceptors } from "../../hooks";
import { CenterLayout } from "../CenterLayout";
import { Loader } from "@multiversx/sdk-dapp/UI";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";

export const NavBarLayout = ({ children }: PropsWithChildren) => {
  const { interceptorApplied } = useSetupInterceptors();
  const { address } = useGetAccountInfo();

  const logoutHandler = () => {
    logout(routeNames.unlock);
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  X<span className="text-cyan-400">-ESCROW</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                  DApp
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                MultiversX P2P Escrow Protocol
              </p>
            </div>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-3">
            {/* Network indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Devnet</span>
            </div>

            {/* Address badge */}
            {address && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-slate-300">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex-shrink-0"></div>
                <span>{shortAddress}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logoutHandler}
              type="button"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all duration-200 flex items-center gap-1.5 hover:shadow-lg hover:shadow-rose-500/10"
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
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MultiversX Token Escrow Smart Contract & DApp</span>
          <span className="text-slate-600">Built with Rust & React 18</span>
        </div>
      </footer>
    </div>
  );
};
