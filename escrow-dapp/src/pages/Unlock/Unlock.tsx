import {
  type ExtensionLoginButtonPropsType,
  type WebWalletLoginButtonPropsType,
  type LedgerLoginContainerPropsType,
  type WalletConnectLoginButtonPropsType,
  WalletConnectLoginButton,
  LedgerLoginButton,
  ExtensionLoginButton,
  CrossWindowLoginButton,
} from "@multiversx/sdk-dapp/UI";
import { routeNames } from "../../routes";
import { useNavigate } from "react-router-dom";

type CommonPropsType =
  | ExtensionLoginButtonPropsType
  | WebWalletLoginButtonPropsType
  | LedgerLoginContainerPropsType
  | WalletConnectLoginButtonPropsType;

export const Unlock = () => {
  const navigate = useNavigate();
  const commonProps: CommonPropsType = {
    callbackRoute: routeNames.dashboard,
    nativeAuth: true,
    onLoginRedirect: () => {
      navigate(routeNames.dashboard);
    },
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 w-full max-w-md p-8 glass-panel rounded-3xl shadow-2xl border border-slate-800 text-center space-y-6">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/25 mx-auto">
          <svg
            className="w-8 h-8 text-white"
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
          <h1 className="text-2xl font-black tracking-tight text-white">
            X<span className="text-cyan-400">-ESCROW</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Decentralized Peer-to-Peer Token Escrow on the MultiversX Blockchain
          </p>
        </div>

        <div className="pt-2 pb-1 border-t border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Connection Provider
          </span>
        </div>

        {/* Login Buttons Container */}
        <div className="flex flex-col gap-3">
          <div className="w-full [&>button]:!w-full [&>button]:!py-3 [&>button]:!rounded-xl [&>button]:!bg-slate-800/80 [&>button]:!border [&>button]:!border-slate-700/80 [&>button]:hover:!border-cyan-500/60 [&>button]:hover:!bg-slate-800 [&>button]:!text-sm [&>button]:!font-bold [&>button]:!text-white [&>button]:!transition-all">
            <ExtensionLoginButton
              loginButtonText="MultiversX DeFi Wallet"
              {...commonProps}
            />
          </div>

          <div className="w-full [&>button]:!w-full [&>button]:!py-3 [&>button]:!rounded-xl [&>button]:!bg-slate-800/80 [&>button]:!border [&>button]:!border-slate-700/80 [&>button]:hover:!border-cyan-500/60 [&>button]:hover:!bg-slate-800 [&>button]:!text-sm [&>button]:!font-bold [&>button]:!text-white [&>button]:!transition-all">
            <WalletConnectLoginButton
              loginButtonText="xPortal Mobile App"
              {...commonProps}
            />
          </div>

          <div className="w-full [&>button]:!w-full [&>button]:!py-3 [&>button]:!rounded-xl [&>button]:!bg-slate-800/80 [&>button]:!border [&>button]:!border-slate-700/80 [&>button]:hover:!border-cyan-500/60 [&>button]:hover:!bg-slate-800 [&>button]:!text-sm [&>button]:!font-bold [&>button]:!text-white [&>button]:!transition-all">
            <CrossWindowLoginButton
              loginButtonText="MultiversX Web Wallet"
              {...commonProps}
            />
          </div>

          <div className="w-full [&>button]:!w-full [&>button]:!py-3 [&>button]:!rounded-xl [&>button]:!bg-slate-800/80 [&>button]:!border [&>button]:!border-slate-700/80 [&>button]:hover:!border-cyan-500/60 [&>button]:hover:!bg-slate-800 [&>button]:!text-sm [&>button]:!font-bold [&>button]:!text-white [&>button]:!transition-all">
            <LedgerLoginButton loginButtonText="Ledger Hardware" {...commonProps} />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2">
          By connecting a wallet, you agree to decentralized smart contract terms.
        </div>
      </div>
    </div>
  );
};
