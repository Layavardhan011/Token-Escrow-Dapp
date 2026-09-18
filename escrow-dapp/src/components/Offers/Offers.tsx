import { Loader } from "@multiversx/sdk-dapp/UI";
import { IOffersProps, useOffers } from "../../hooks";
import { Card } from "../Card";
import { useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks/transactions/useTrackTransactionStatus";
import { useEffect } from "react";
import { removeSignedTransaction } from "@multiversx/sdk-dapp/services/transactions/clearTransactions";
import { Table } from "../Table";

interface IOfferComponentProps extends IOffersProps {
  cardTitle: string;
  transactionSessionId?: string;
}

const TABLE_HEAD = ["ID", "Creator", "Offered Asset", "Requested Asset", "Counterparty", "Action"];

export const Offers = ({
  endpoint,
  actionCallback,
  actionLable,
  actionInProgress,
  cardTitle,
  transactionSessionId,
}: IOfferComponentProps) => {
  const transactionStatus = useTrackTransactionStatus({
    transactionId: transactionSessionId || "",
  });
  const { tableRows, loading, error, refetch } = useOffers({
    actionInProgress: actionInProgress,
    endpoint,
    actionCallback,
    actionLable,
  });

  useEffect(() => {
    if (transactionStatus.isSuccessful && transactionSessionId) {
      removeSignedTransaction(transactionSessionId);
      refetch();
    }
  }, [transactionStatus]);

  return (
    <Card
      title={cardTitle}
      subtitle={
        endpoint.includes("created")
          ? "Offers you initiated and locked in escrow"
          : "Offers targeted specifically to your address"
      }
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader noText />
          <span className="text-xs text-slate-400">Loading escrow records...</span>
        </div>
      ) : tableRows.length > 0 ? (
        <div className="w-full">
          <Table rows={tableRows} header={TABLE_HEAD} />
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-rose-300">Could not retrieve offers</span>
          <p className="text-xs text-slate-400 mt-1">Please check your network connection</p>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-200">No active offers</span>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            {endpoint.includes("created")
              ? "You haven't created any open escrow offers yet. Create your first offer using the panel on the left."
              : "No counterparty offers found for your address. When someone initiates a trade with you, it will appear here."}
          </p>
        </div>
      )}
    </Card>
  );
};
