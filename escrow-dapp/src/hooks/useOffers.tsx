import useAxios from "axios-hooks";
import { ESCROW_API_SERVICE_URL } from "../config";
import { useEffect, useState } from "react";
import { Trim } from "@multiversx/sdk-dapp/UI";
import { formatByTokenId } from "../helpers";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";

export interface IOffersProps {
  endpoint: string;
  actionLable: string;
  actionCallback: (offerId: number) => void;
  actionInProgress?: boolean;
}

interface IOfferResponse {
  offerId: number;
  creator: string;
  offeredPayment: {
    amount: string;
    tokenIdentifier: string;
    nonce: number;
  };
  acceptedPayment: {
    amount: string;
    tokenIdentifier: string;
    nonce: number;
  };
  acceptedAddress: string;
}

export const useOffers = ({
  endpoint,
  actionLable,
  actionCallback,
  actionInProgress,
}: IOffersProps) => {
  const { address } = useGetAccountInfo();
  const [{ data, loading, error }, getOffers] = useAxios<IOfferResponse[]>({
    url: `${ESCROW_API_SERVICE_URL}${endpoint}?address=${address}`,
    method: "GET",
  });

  const [tableRows, setTableRows] = useState<Array<JSX.Element[]>>([]);
  const [elementsCreated, setElementsCreated] = useState(false);

  useEffect(() => {
    if (data) {
      createTableElements(data);
    }
  }, [data, actionInProgress]);

  const createTableElements = async (data: IOfferResponse[]) => {
    const rows: Array<JSX.Element[]> = [];
    for (let dataRow of data) {
      const row = [
        <>{dataRow.offerId}</>,
        <Trim text={dataRow.creator} />,
        <>
          {await formatByTokenId(
            dataRow.offeredPayment.tokenIdentifier,
            dataRow.offeredPayment.amount
          )}
        </>,

        <>
          {dataRow.acceptedPayment.amount}
          {dataRow.acceptedPayment.tokenIdentifier}
        </>,
        <Trim text={dataRow.acceptedAddress} />,
        <button
          onClick={() => actionCallback(dataRow.offerId)}
          disabled={actionInProgress}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
            actionLable === "Cancel"
              ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 shadow-sm"
              : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 shadow-sm"
          }`}
        >
          {actionLable}
        </button>,
      ];
      rows.push(row);
    }
    setTableRows(rows);
    setElementsCreated(true);
  };

  return {
    tableRows,
    loading: (loading || !elementsCreated) && !error,
    error,
    refetch: getOffers,
  };
};
