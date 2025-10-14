import { Input } from "@elements/Input";
import type { TargetedFocusEvent, TargetedSubmitEvent } from "preact";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { SuppliersType } from "./Suppliers";

interface SupplierDataFormProps {
  supplierData?: SuppliersType;
  doOnSubmit: (
    supplierData: Omit<SuppliersType, "id">
  ) => Promise<{ [key: string]: string } | undefined>;
}

type stringFieldValidationOptions = {
  min?: number;
  max?: number;
  required?: boolean;
};

export function SupplierDataForm({
  supplierData,
  doOnSubmit,
}: SupplierDataFormProps) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [salesperson, setSalesperson] = useState("");

  useEffect(() => {
    if (supplierData) {
      setName(supplierData.name);
      setCnpj(supplierData.cnpj);
      setEmail(supplierData.email || "");
      setPhoneNumber(supplierData.phone_number || "");
      setMobileNumber(supplierData.mobile_number || "");
      setAddress(supplierData.address || "");
      setSalesperson(supplierData.salesperson || "");
    }
  }, [supplierData]);

  function validateStringFieldOnBlur(
    e: TargetedFocusEvent<HTMLInputElement>,
    setValue: Dispatch<StateUpdater<string>>,
    options: stringFieldValidationOptions
  ) {
    const { min, max, required } = options;
    const value = e.currentTarget.value;
    const name = e.currentTarget.name;

    setValue(value);

    if (required && value.length == 0) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "Esse campo é obrigatório",
      }));
      return;
    }

    const minError = !min ? false : value.length < min;
    const maxError = !max ? false : value.length > max;

    if (maxError || minError) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: `Esse campo deve ter no ${maxError ? "máximo" : "mínimo"} ${
          maxError ? max : min
        } caracteres`,
      }));
      return;
    }

    setValidationErrors((prev) => {
      delete prev[name];
      return prev;
    });
  }

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      window.alert("Só é possivel salvar com dados válidos.");
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

    const errors = await doOnSubmit({
      name,
      cnpj,
      email: email || null,
      address: address || null,
      phone_number: phoneNumber || null,
      mobile_number: mobileNumber || null,
      salesperson: salesperson || null,
    });

    if (errors) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  return (
    <form onSubmit={onFormSubmit} className={"flex flex-col gap-2 w-ful"}>
      <Input
        label="Nome do fornecedor"
        name="name"
        errors={validationErrors}
        value={name}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setName, {
            min: 4,
            max: 100,
            required: true,
          });
        }}
      />
      <div className={"flex gap-4"}>
        <Input
          label="CNPJ/CPF"
          name="cnpj"
          errors={validationErrors}
          value={cnpj}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setCnpj, {
              min: 4,
              max: 20,
              required: true,
            });
          }}
        />
        <Input
          label="E-mail"
          name="email"
          errors={validationErrors}
          value={email}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setEmail, {
              min: 0,
              max: 50,
              required: false,
            });
          }}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Telefone"
          name="phone_number"
          errors={validationErrors}
          value={phoneNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setPhoneNumber, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
        />
        <Input
          label="Celular"
          name="mobile_number"
          errors={validationErrors}
          value={mobileNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setMobileNumber, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
        />
      </div>
      <Input
        label="Endereço"
        name="address"
        type="text"
        errors={validationErrors}
        value={address}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setAddress, {
            min: 0,
            max: 150,
            required: false,
          });
        }}
      />
      <Input
        label="Vendedor / Representante"
        name="salesperson"
        type="text"
        errors={validationErrors}
        value={salesperson}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setSalesperson, {
            min: 0,
            max: 80,
            required: false,
          });
        }}
      />
      <div className={"flex gap-4 justify-end"}>
        <button
          className={
            "bg-blue-800 p-2 max-w-2xl rounded-md font-semibold text-white"
          }
          type={"submit"}
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
