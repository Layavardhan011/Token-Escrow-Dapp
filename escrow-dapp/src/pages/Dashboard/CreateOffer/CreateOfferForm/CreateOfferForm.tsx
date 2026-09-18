import { object, string } from "yup";
import { addressIsValid } from "@multiversx/sdk-dapp/utils/account/addressIsValid";
import { Form, Formik } from "formik";
import useAxios from "axios-hooks";
import { IToken, TokensTypeEnum } from "../../../../components/types";
import { MX_API_SERVICE_URL } from "../../../../config";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";
import { useEffect, useState } from "react";
import { formatByTokenId } from "../../../../helpers";
import { Loader } from "@multiversx/sdk-dapp/UI";

interface ICreateOfferFormProps {
  onSubmit: (values: ICreateOfferForm) => void;
  loading: boolean;
}

export interface ICreateOfferForm {
  offeredToken: string;
  offeredAmount: string;
  acceptedToken: string;
  acceptedAmount: string;
  acceptedAddress: string;
  acceptedNonce: number;
  deadlineHours?: number;
}

const initialValues: ICreateOfferForm = {
  offeredToken: "EGLD",
  offeredAmount: "",
  acceptedToken: "USDC-123456",
  acceptedAmount: "",
  acceptedAddress: "",
  acceptedNonce: 0,
  deadlineHours: 0,
};

const CreateOfferSchema = object().shape({
  offeredToken: string().required("Offered token is required"),
  offeredAmount: string().required("Offered amount is required"),
  acceptedToken: string().required("Accepted token is required"),
  acceptedAddress: string()
    .required("Target recipient address is required")
    .test(
      "is-valid-address",
      "Invalid MultiversX bech32 address",
      (value) => value === null || addressIsValid(value)
    ),
  acceptedAmount: string().required("Accepted amount is required"),
});

export const CreateOfferForm = ({
  onSubmit,
  loading,
}: ICreateOfferFormProps) => {
  const { address } = useGetAccountInfo();
  const [{ data: tokensData }] = useAxios<IToken[]>({
    url: `${MX_API_SERVICE_URL}/accounts/${address}/tokens`,
    method: "GET",
  });

  const [formatedTokensData, setFromatedTokensData] = useState<IToken[]>([
    {
      type: TokensTypeEnum.fungibleESDT,
      identifier: "EGLD",
      name: "MultiversX eGold",
      ticker: "EGLD",
      decimals: 18,
      balance: "Available",
    },
  ]);

  useEffect(() => {
    if (tokensData) {
      formatTokensData(tokensData);
    }
  }, [tokensData]);

  const formatTokensData = async (rawTokens: IToken[]) => {
    const list: IToken[] = [
      {
        type: TokensTypeEnum.fungibleESDT,
        identifier: "EGLD",
        name: "MultiversX eGold",
        ticker: "EGLD",
        decimals: 18,
        balance: "Available",
      },
    ];

    for (const t of rawTokens) {
      try {
        const formattedBal = await formatByTokenId(t.identifier, t.balance, false);
        list.push({ ...t, balance: formattedBal });
      } catch {
        list.push(t);
      }
    }
    setFromatedTokensData(list);
  };

  const [acceptedAddressIsValid, setAcceptedAddressIsValid] = useState(false);
  const [acceptedAddress, setAcceptedAddress] = useState("");

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        const currentSeconds = Math.floor(Date.now() / 1000);
        const deadline =
          values.deadlineHours && values.deadlineHours > 0
            ? currentSeconds + values.deadlineHours * 3600
            : 0;

        onSubmit({
          ...values,
          deadlineHours: deadline,
        });
      }}
      validationSchema={CreateOfferSchema}
    >
      {({ errors, setFieldValue, values, touched }) => (
        <Form className="space-y-5">
          {/* Step 1: Offered Asset */}
          <div className="p-4 rounded-xl bg-slate-850 bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                You Lock & Deposit
              </span>
              <span>Available in Wallet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Token
                </label>
                <select
                  value={values.offeredToken}
                  onChange={(e) => setFieldValue("offeredToken", e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-cyan-400"
                >
                  {formatedTokensData.map((token) => (
                    <option key={token.identifier} value={token.identifier}>
                      {token.ticker || token.identifier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1.0"
                  value={values.offeredAmount}
                  onChange={(e) => setFieldValue("offeredAmount", e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {errors.offeredAmount && touched.offeredAmount && (
                  <p className="text-xs text-rose-400 mt-1">{errors.offeredAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Divider with Swap Icon */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Step 2: Desired Payment Terms */}
          <div className="p-4 rounded-xl bg-slate-850 bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              You Receive in Return
            </span>

            {/* Target Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Designated Recipient (Counterparty Address)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="erd1..."
                  value={values.acceptedAddress}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setFieldValue("acceptedAddress", val);
                    const valid = addressIsValid(val);
                    setAcceptedAddressIsValid(valid);
                    setAcceptedAddress(valid ? val : "");
                  }}
                  className={`w-full bg-slate-800/80 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none ${
                    acceptedAddressIsValid
                      ? "border-emerald-500/80 focus:border-emerald-400"
                      : errors.acceptedAddress && touched.acceptedAddress
                      ? "border-rose-500/80 focus:border-rose-400"
                      : "border-slate-700/80 focus:border-indigo-400"
                  }`}
                />
                {acceptedAddressIsValid && (
                  <div className="absolute right-3 top-2.5 text-emerald-400 text-xs flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.acceptedAddress && touched.acceptedAddress && (
                <p className="text-xs text-rose-400 mt-1">{errors.acceptedAddress}</p>
              )}
            </div>

            {/* Requested Token & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Token Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. USDC-123456"
                  value={values.acceptedToken}
                  onChange={(e) => setFieldValue("acceptedToken", e.target.value.trim())}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Required Amount
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 500"
                  value={values.acceptedAmount}
                  onChange={(e) => setFieldValue("acceptedAmount", e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                {errors.acceptedAmount && touched.acceptedAmount && (
                  <p className="text-xs text-rose-400 mt-1">{errors.acceptedAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Expiration Controls */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Offer Expiration Deadline</span>
              <span className="text-[11px] text-slate-500">Auto-cancellable after time</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "None", value: 0 },
                { label: "1 Hour", value: 1 },
                { label: "24 Hours", value: 24 },
                { label: "3 Days", value: 72 },
              ].map((pill) => (
                <button
                  type="button"
                  key={pill.value}
                  onClick={() => setFieldValue("deadlineHours", pill.value)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    values.deadlineHours === pill.value
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader noText />
                <span>Preparing Transaction...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Lock Tokens & Create Escrow</span>
              </>
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
};
