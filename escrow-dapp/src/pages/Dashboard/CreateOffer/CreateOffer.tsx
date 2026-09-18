import useAxios from "axios-hooks";
import { Card } from "../../../components/Card";
import { CreateOfferForm, ICreateOfferForm } from "./CreateOfferForm";
import { IPlainTransactionObject, Transaction } from "@multiversx/sdk-core/out";
import { ESCROW_API_SERVICE_URL } from "../../../config";
import { parseByTokenId } from "../../../helpers";
import { sendTransactions } from "@multiversx/sdk-dapp/services/transactions/sendTransactions";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account/useGetAccountInfo";

export const CreateOffer = () => {
  const { address } = useGetAccountInfo();
  const [{ loading }, createOffer] = useAxios<IPlainTransactionObject>(
    {
      url: `${ESCROW_API_SERVICE_URL}/offers/create`,
      method: "POST",
    },
    { manual: true }
  );

  const onSubmit = async (values: ICreateOfferForm) => {
    const { data: plainTransaction } = await createOffer({
      data: {
        ...values,
        sender: address,
        deadline: values.deadlineHours || 0,
        offeredAmount: await parseByTokenId(
          values.offeredToken,
          values.offeredAmount
        ),
      },
    });

    if (plainTransaction) {
      await sendTransactions({
        transactions: Transaction.fromPlainObject(plainTransaction),
        transactionDisplayInfo: {
          processingMessage: "Processing Escrow Lock transaction...",
          errorMessage: "An error occurred while creating offer",
          successMessage: "Escrow offer created successfully!",
        },
        redirectAfterSigning: false,
      });
    }
  };

  return (
    <Card
      title="Create Escrow Offer"
      subtitle="Deposit tokens into escrow and specify swap terms"
    >
      <CreateOfferForm onSubmit={onSubmit} loading={loading} />
    </Card>
  );
};
