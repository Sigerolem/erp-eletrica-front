import { DataForm } from "@elements/DataForm";
import { Input } from "@elements/Input";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import type { JSX, TargetedSubmitEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { TransactionsType } from "./Transactions";
import type { QuotationsType } from "@comp/quotations/Quotations";

export function CustomerDataForm({
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

  const [quotation, setQuotation] = useState<Partial<QuotationsType>>({});
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (transactionData) {
      //set the state
      setQuotation(transactionData.quotation);
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
          label="Nome"
          name="name"
          errors={validationErrors}
          // value={name}
          disabled={true}
        />
        <Input
          label="CNPJ/CPF"
          name="cnpj"
          errors={validationErrors}
          value={cnpj}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setCnpj, setValidationErrors, {
              min: 9,
              max: 18,
              required: true,
            });
          }}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Telefone"
          name="phoneNumber"
          errors={validationErrors}
          value={phoneNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setPhoneNumber, setValidationErrors, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
        />
        <Input
          label="Celular"
          name="mobileNumber"
          errors={validationErrors}
          value={mobileNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setMobileNumber, setValidationErrors, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
        />
      </div>
      <Input
        label="Email"
        name="email"
        type="text"
        errors={validationErrors}
        value={email}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setEmail, setValidationErrors, {
            min: 10,
            max: 50,
            required: false,
          });
        }}
      />
      <Input
        label="Endereço"
        name="address"
        type="text"
        errors={validationErrors}
        value={address}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setAddress, setValidationErrors, {
            min: 0,
            max: 150,
            required: false,
          });
        }}
      />
      {children}
    </DataForm>
  );
}
