import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";
import { FormatAmount } from "@multiversx/sdk-dapp/UI";
import { useState } from "react";

export const AccountInfo = () => {
  const {
    address,
    account: { balance, username },
    shard,
  } = useGetAccountInfo();

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = address
    ? `${address.substring(0, 10)}...${address.substring(address.length - 8)}`
    : "Not Connected";

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Metric */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Available Balance
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              <FormatAmount value={balance} showLastNonZeroDecimal />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            MultiversX Native
          </div>
        </div>

        {/* Address Metric */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Connected Wallet
            </span>
            {username && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                @{username}
              </span>
            )}
          </div>
          <div className="my-2 flex items-center justify-between gap-2">
            <span
              className="text-sm font-mono text-slate-200 truncate"
              title={address}
            >
              {shortAddress}
            </span>
            <button
              onClick={copyToClipboard}
              type="button"
              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 flex-shrink-0"
              title="Copy Address"
            >
              {copied ? (
                <span className="text-xs text-green-400 font-sans font-semibold">
                  Copied!
                </span>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="text-xs text-slate-400">
            Click to copy full address
          </div>
        </div>

        {/* Network & Shard Metric */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Network Status
          </span>
          <div className="my-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-white">
                Devnet Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Shard:</span>
            <span className="px-2 py-0.5 rounded bg-slate-700/80 text-cyan-300 font-mono font-bold">
              {shard !== undefined ? shard : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
