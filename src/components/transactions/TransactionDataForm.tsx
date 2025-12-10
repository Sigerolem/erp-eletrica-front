import { DataForm } from "@elements/DataForm";
import { Input } from "@elements/Input";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import type { JSX, TargetedSubmitEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { TransactionsStatusType, TransactionsType } from "./Transactions";
import type { QuotationsType } from "@comp/quotations/Quotations";
import { formatTransactionStatusEnum } from "src/utils/formating";
import { Textarea } from "src/elements/TextArea";

export function TransactionDataForm({
  transactionData,
  doOnSubmit,
  children,
}: {
  doOnSubmit: (
    transactionData: Partial<TransactionsType>
  ) => Promise<{ [key: string]: string } | null>;
  transactionData?: TransactionsType;
  children: JSX.Element;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [quotation, setQuotation] = useState<Partial<QuotationsType>>({
    reference: "Carregando...",
    slug: "Carregando...",
  });
  const [status, setStatus] = useState<TransactionsStatusType>("draft");
  const [email, setEmail] = useState("");
  const [transaction, setTransaction] = useState<TransactionsType | null>(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (transactionData) {
      //set the state
      setQuotation(transactionData.quotation);
      setStatus(transactionData.status);
      setTransaction({ ...transactionData });
    }
  }, [transactionData]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      window.alert("Só é possivel salvar com dados válidos.");
      return;
    }

    // if (name == "") {
    //   setValidationErrors((prev) => ({
    //     ...prev,
    //     name: "Esse campo é obrigatório.",
    //   }));
    //   return;
    // }

    const newTransactionData: Partial<TransactionsType> = {
      // relevant data for an update
    };

    const errors = await doOnSubmit(newTransactionData);

    if (errors) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  return (
    <DataForm onSubmit={onFormSubmit}>
      <div className={"flex gap-4"}>
        <Input
          label="Referência da OS"
          name="reference"
          value={quotation.reference}
          disabled={true}
          className={"bg-blue-50!"}
        />
        <Input
          label="Código da OS"
          name="slug"
          value={quotation.slug}
          disabled={true}
          className={"bg-blue-50!"}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Cliente"
          name="customer"
          value={quotation?.customer?.name || "Carregando..."}
          disabled={true}
          className={"bg-blue-50!"}
        />
        <Input
          label="Situação"
          name="status"
          value={formatTransactionStatusEnum(status)}
          disabled={true}
          className={"bg-blue-50!"}
        />
        <Input
          label="Data errada"
          name="status"
          value={new Date(transaction?.created_at || "").toLocaleDateString()}
          disabled={true}
          className={"bg-blue-50!"}
        />
      </div>
      <Textarea
        label="Descrição"
        name="description"
        errors={validationErrors}
        value={quotation.description}
        disabled={true}
        className={"bg-blue-50!"}
      />
      <div className={"flex gap-4"}>
        <section
          className={
            "w-full border border-slate-300 rounded-md p-2 flex flex-col gap-2"
          }
        >
          <div className={"grid grid-cols-4 gap-x-4"}>
            <span className={"font-semibold text-lg pl-2"}>Material</span>
            <span className={"font-semibold text-lg pl-2"}>Código</span>
            <span className={"font-semibold text-lg pl-2"}>
              Qtd. Solicitada
            </span>
            {["ongoing", "partial", "concluded"].includes(
              transaction?.status || ""
            ) ? (
              transaction?.status == "ongoing" ? (
                <span className={"font-semibold text-lg pl-2"}>
                  Qtd. Separada
                </span>
              ) : (
                <span className={"font-semibold text-lg pl-2"}>
                  Qtd. Enviada
                </span>
              )
            ) : (
              <span className={"font-semibold text-lg pl-2"}>
                Qtd. em Estoque
              </span>
            )}
          </div>

          {transaction?.items.map((item) => (
            <div className={"grid grid-cols-4 gap-x-4"}>
              <span
                className={
                  "p-1 rounded-md font-semibold border border-slate-300"
                }
              >
                {item.name}
              </span>
              <span
                className={
                  "p-1 rounded-md font-semibold border border-slate-300 overflow-hidden"
                }
              >
                {item.material?.barcode || "sem código de barras"}
              </span>
              <span
                className={
                  "p-1 rounded-md font-semibold border border-slate-300"
                }
              >
                {item.expected_amount}
              </span>
              {["ongoing", "partial", "concluded"].includes(
                transaction.status
              ) ? (
                <span
                  className={
                    "p-1 rounded-md font-semibold border border-slate-300"
                  }
                >
                  {item.separated_amount}
                </span>
              ) : (
                <span
                  className={
                    "p-1 rounded-md font-semibold border border-slate-300"
                  }
                >
                  {item.material?.current_amount}
                </span>
              )}
              {/* <Input name="takenAmount" value={item.material?.current_amount} /> */}
            </div>
          ))}
        </section>
      </div>
      {children}
    </DataForm>
  );
}
