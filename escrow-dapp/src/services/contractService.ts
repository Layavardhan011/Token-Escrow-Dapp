import {
  Address,
  Transaction,
  TransactionPayload,
  IPlainTransactionObject,
} from "@multiversx/sdk-core";
import { ESCROW_CONTRACT_ADDRESS } from "../config";

export interface IOfferItem {
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
  deadline?: number;
  status: "Active" | "Accepted" | "Cancelled";
}

const STORAGE_KEY = "mx_escrow_offers_v1";

function getLocalOffers(): IOfferItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalOffers(offers: IOfferItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  } catch (e) {
    console.error("Failed to save offers to storage", e);
  }
}

function toHex(val: string | number | bigint, isText = false): string {
  if (typeof val === "number" || typeof val === "bigint") {
    if (val === 0 || val === BigInt(0)) return "";
    let hex = BigInt(val).toString(16);
    return hex.length % 2 !== 0 ? "0" + hex : hex;
  }
  if (isText) {
    return Buffer.from(val, "utf8").toString("hex");
  }
  return val;
}

function addressToHex(bech32Addr: string): string {
  try {
    if (!bech32Addr) return "";
    return new Address(bech32Addr).hex();
  } catch {
    return "";
  }
}

export const ContractService = {
  getCreatedOffers(userAddress: string): IOfferItem[] {
    const all = getLocalOffers();
    return all.filter(
      (o) => o.creator === userAddress && o.status === "Active"
    );
  },

  getReceivedOffers(userAddress: string): IOfferItem[] {
    const all = getLocalOffers();
    return all.filter(
      (o) =>
        (o.acceptedAddress === userAddress || !o.acceptedAddress) &&
        o.creator !== userAddress &&
        o.status === "Active"
    );
  },

  buildCreateOfferTransaction(params: {
    sender: string;
    offeredToken: string;
    offeredAmount: string;
    acceptedAddress: string;
    acceptedToken: string;
    acceptedAmount: string;
    acceptedNonce?: number;
    deadline?: number;
  }): IPlainTransactionObject {
    const {
      sender,
      offeredToken,
      offeredAmount,
      acceptedAddress,
      acceptedToken,
      acceptedAmount,
      acceptedNonce = 0,
      deadline = 0,
    } = params;

    const offers = getLocalOffers();
    const newOfferId = offers.length > 0 ? Math.max(...offers.map((o) => o.offerId)) + 1 : 1;

    const acceptedAddrHex = addressToHex(acceptedAddress);
    const acceptedTokenHex = toHex(acceptedToken, true);
    const acceptedNonceHex = toHex(acceptedNonce);
    const acceptedAmountHex = toHex(BigInt(acceptedAmount || "0"));
    const deadlineHex = toHex(deadline);

    let txValue = "0";
    let txReceiver = ESCROW_CONTRACT_ADDRESS;
    let dataPayload = "";

    const isEgld = offeredToken === "EGLD" || offeredToken === "WEGLD";

    if (isEgld) {
      txValue = offeredAmount;
      dataPayload = `createOffer@${acceptedAddrHex}@${acceptedTokenHex}@${acceptedNonceHex}@${acceptedAmountHex}@${deadlineHex}`;
    } else {
      // ESDT transfer to smart contract
      const offeredTokenHex = toHex(offeredToken, true);
      const offeredAmountHex = toHex(BigInt(offeredAmount || "0"));
      const funcNameHex = toHex("createOffer", true);
      dataPayload = `ESDTTransfer@${offeredTokenHex}@${offeredAmountHex}@${funcNameHex}@${acceptedAddrHex}@${acceptedTokenHex}@${acceptedNonceHex}@${acceptedAmountHex}@${deadlineHex}`;
    }

    const tx = new Transaction({
      nonce: 0,
      value: txValue,
      receiver: new Address(txReceiver),
      sender: new Address(sender || ESCROW_CONTRACT_ADDRESS),
      gasLimit: 12000000,
      data: new TransactionPayload(dataPayload),
      chainID: "D",
    });

    // Optimistically save offer locally
    const newOffer: IOfferItem = {
      offerId: newOfferId,
      creator: sender,
      offeredPayment: {
        amount: offeredAmount,
        tokenIdentifier: offeredToken,
        nonce: 0,
      },
      acceptedPayment: {
        amount: acceptedAmount,
        tokenIdentifier: acceptedToken,
        nonce: acceptedNonce,
      },
      acceptedAddress,
      deadline,
      status: "Active",
    };
    offers.push(newOffer);
    saveLocalOffers(offers);

    return tx.toPlainObject();
  },

  buildCancelOfferTransaction(params: {
    sender: string;
    offerId: number;
  }): IPlainTransactionObject {
    const { sender, offerId } = params;
    const offerIdHex = toHex(offerId);

    const tx = new Transaction({
      nonce: 0,
      value: "0",
      receiver: new Address(ESCROW_CONTRACT_ADDRESS),
      sender: new Address(sender || ESCROW_CONTRACT_ADDRESS),
      gasLimit: 8000000,
      data: new TransactionPayload(`cancelOffer@${offerIdHex}`),
      chainID: "D",
    });

    const offers = getLocalOffers();
    const target = offers.find((o) => o.offerId === offerId);
    if (target) {
      target.status = "Cancelled";
      saveLocalOffers(offers);
    }

    return tx.toPlainObject();
  },

  buildConfirmOfferTransaction(params: {
    sender: string;
    offerId: number;
  }): IPlainTransactionObject {
    const { sender, offerId } = params;
    const offers = getLocalOffers();
    const target = offers.find((o) => o.offerId === offerId);

    const wantedToken = target?.acceptedPayment.tokenIdentifier || "EGLD";
    const wantedAmount = target?.acceptedPayment.amount || "0";
    const offerIdHex = toHex(offerId);

    const isEgld = wantedToken === "EGLD" || wantedToken === "WEGLD";

    let txValue = "0";
    let dataPayload = "";

    if (isEgld) {
      txValue = wantedAmount;
      dataPayload = `acceptOffer@${offerIdHex}`;
    } else {
      const wantedTokenHex = toHex(wantedToken, true);
      const wantedAmountHex = toHex(BigInt(wantedAmount || "0"));
      const funcNameHex = toHex("acceptOffer", true);
      dataPayload = `ESDTTransfer@${wantedTokenHex}@${wantedAmountHex}@${funcNameHex}@${offerIdHex}`;
    }

    const tx = new Transaction({
      nonce: 0,
      value: txValue,
      receiver: new Address(ESCROW_CONTRACT_ADDRESS),
      sender: new Address(sender || ESCROW_CONTRACT_ADDRESS),
      gasLimit: 12000000,
      data: new TransactionPayload(dataPayload),
      chainID: "D",
    });

    if (target) {
      target.status = "Accepted";
      saveLocalOffers(offers);
    }

    return tx.toPlainObject();
  },
};
