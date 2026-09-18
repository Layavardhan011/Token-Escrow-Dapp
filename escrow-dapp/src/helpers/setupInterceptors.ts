import axios from "axios";
import { ESCROW_API_SERVICE_URL } from "../config";
import { ContractService } from "../services/contractService";

export const setupInterceptors = (authToken?: string) => {
  axios.interceptors.request.use(async (config) => {
    if (authToken) {
      config.headers.set("Authorization", `Bearer ${authToken}`);
    }

    // Intercept requests directed to the Escrow API and handle them via direct smart contract service
    if (config.url && config.url.startsWith(ESCROW_API_SERVICE_URL)) {
      const path = config.url.replace(ESCROW_API_SERVICE_URL, "");

      config.adapter = async () => {
        try {
          if (path.startsWith("/offers/create") && config.method === "post") {
            const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
            const plainTx = ContractService.buildCreateOfferTransaction(body);
            return {
              data: plainTx,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }

          if (path.startsWith("/offers/cancel") && config.method === "post") {
            const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
            const plainTx = ContractService.buildCancelOfferTransaction(body);
            return {
              data: plainTx,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }

          if (path.startsWith("/offers/confirm") && config.method === "post") {
            const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
            const plainTx = ContractService.buildConfirmOfferTransaction(body);
            return {
              data: plainTx,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }

          if (path.startsWith("/offers/created")) {
            const urlObj = new URL(config.url!, "http://localhost");
            const address = urlObj.searchParams.get("address") || "";
            const offers = ContractService.getCreatedOffers(address);
            return {
              data: offers,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }

          if (path.startsWith("/offers/received")) {
            const urlObj = new URL(config.url!, "http://localhost");
            const address = urlObj.searchParams.get("address") || "";
            const offers = ContractService.getReceivedOffers(address);
            return {
              data: offers,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }

          return {
            data: [],
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        } catch (err: any) {
          console.error("Escrow contract adapter error:", err);
          return {
            data: { error: err.message },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config,
          };
        }
      };
    }

    return config;
  });
};
