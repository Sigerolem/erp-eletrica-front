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
        />
        <Input
          label="Código da OS"
          name="slug"
          value={quotation.slug}
          disabled={true}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Cliente"
          name="customer"
          value={quotation?.customer?.name || "Carregando..."}
          disabled={true}
        />
        <Input
          label="Situação"
          name="status"
          value={formatTransactionStatusEnum(status)}
          disabled={true}
        />
        <Input
          label="Data errada"
          name="status"
          value={new Date(transaction?.created_at || "").toLocaleDateString()}
          disabled={true}
        />
      </div>
      <Textarea
        label="Descrição"
        name="description"
        errors={validationErrors}
        value={quotation.description}
        disabled={true}
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
            <span className={"font-semibold text-lg pl-2"}>
              Qtd. em Estoque
            </span>
          </div>

          {transaction?.items.map((item) => (
            <div className={"grid grid-cols-4 gap-x-4"}>
              <span
                className={
                  "p-1 bg-white rounded-md font-semibold border border-slate-300"
                }
              >
                {item.name}
              </span>
              <span
                className={
                  "p-1 bg-white rounded-md font-semibold border border-slate-300"
                }
              >
                {item.material?.barcode || "sem código de barras"}
              </span>
              <span
                className={
                  "p-1 bg-white rounded-md font-semibold border border-slate-300"
                }
              >
                {item.expected_amount}
              </span>
              <span
                className={
                  "p-1 bg-white rounded-md font-semibold border border-slate-300"
                }
              >
                {item.material?.current_amount}
              </span>
              {/* <Input name="takenAmount" value={item.material?.current_amount} /> */}
            </div>
          ))}
        </section>
      </div>
      {children}
    </DataForm>
  );
}
