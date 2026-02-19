import { useEffect, useState } from "preact/hooks";
import type { JSX, TargetedSubmitEvent } from "preact";
import { Input } from "@elements/Input";
import { DataForm } from "@elements/DataForm";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import type { CustomersType } from "@comp/customers/Customers";
import { Checkbox } from "src/elements/Checkbox";

export function CustomerDataForm({
  customerData,
  doOnSubmit,
  children,
}: {
  doOnSubmit: (
    customerData: Partial<CustomersType>,
  ) => Promise<{ [key: string]: string } | null>;
  customerData?: CustomersType;
  children: JSX.Element;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (customerData) {
      setName(customerData.name);
      setCnpj(customerData.cnpj);
      setEmail(customerData.email || "");
      setPhoneNumber(customerData.phone_number || "");
      setMobileNumber(customerData.mobile_number || "");
      setAddress(customerData.address || "");
      setPrefers(customerData.prefers_es);
    }
  }, [customerData]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      window.alert(
        "Só é possivel salvar com dados válidos. Talvez seja necessário atualizar a página.",
      );
      return;
    }

    if (name == "") {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Esse campo é obrigatório.",
      }));
      return;
    }
    if (cnpj == "") {
      setValidationErrors((prev) => ({
        ...prev,
        cnpj: "Esse campo é obrigatório.",
      }));
      return;
    }

    const newCustomerData = {
      name,
      cnpj,
      email,
      address: address || null,
      phone_number: phoneNumber || null,
      mobile_number: mobileNumber || null,
      prefers_es: prefers,
    };

    const errors = await doOnSubmit(newCustomerData);

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
          value={name}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setName, setValidationErrors, {
              min: 4,
              max: 100,
              required: true,
            });
          }}
        />
        <Input
          label="CNPJ/CPF"
          name="cnpj"
          errors={validationErrors}
          value={cnpj}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setCnpj, setValidationErrors, {
              min: 10,
              max: 19,
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
      <div className={"flex gap-4"}>
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
        <Checkbox
          label="Prefere E.S."
          name="prefers"
          checked={prefers}
          setChecked={setPrefers}
        />
      </div>
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
