import { Input } from "@elements/Input";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import type { JSX, TargetedSubmitEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { SuppliersType } from "./Suppliers";
import { hasPermission } from "src/utils/permissionLogic";

interface SupplierDataFormProps {
  supplierData?: SuppliersType;
  doOnSubmit: (
    supplierData: Omit<SuppliersType, "id">,
  ) => Promise<{ [key: string]: string } | undefined>;
  children: JSX.Element;
}

export function SupplierDataForm({
  supplierData,
  doOnSubmit,
  children,
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
  const [userCanEditSupplier, setUserCanEditSupplier] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");

    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "supplier", "R")
    ) {
      window.location.href = "/";
    }

    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "supplier", "W")
    ) {
      setUserCanEditSupplier(true);
    }
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
          validateStringFieldOnBlur(e, setName, setValidationErrors, {
            min: 4,
            max: 100,
            required: true,
          });
        }}
        disabled={!userCanEditSupplier}
        className={!userCanEditSupplier ? "bg-blue-50!" : ""}
      />
      <div className={"flex gap-4"}>
        <Input
          label="CNPJ/CPF"
          name="cnpj"
          errors={validationErrors}
          value={cnpj}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setCnpj, setValidationErrors, {
              min: 9,
              max: 20,
            });
          }}
          disabled={!userCanEditSupplier}
          className={!userCanEditSupplier ? "bg-blue-50!" : ""}
        />
        <Input
          label="E-mail"
          name="email"
          errors={validationErrors}
          value={email}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setEmail, setValidationErrors, {
              min: 0,
              max: 50,
              required: false,
            });
          }}
          disabled={!userCanEditSupplier}
          className={!userCanEditSupplier ? "bg-blue-50!" : ""}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Telefone"
          name="phone_number"
          errors={validationErrors}
          value={phoneNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setPhoneNumber, setValidationErrors, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
          disabled={!userCanEditSupplier}
          className={!userCanEditSupplier ? "bg-blue-50!" : ""}
        />
        <Input
          label="Celular"
          name="mobile_number"
          errors={validationErrors}
          value={mobileNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setMobileNumber, setValidationErrors, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
          disabled={!userCanEditSupplier}
          className={!userCanEditSupplier ? "bg-blue-50!" : ""}
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
        disabled={!userCanEditSupplier}
        className={!userCanEditSupplier ? "bg-blue-50!" : ""}
      />
      <Input
        label="Vendedor / Representante"
        name="salesperson"
        type="text"
        errors={validationErrors}
        value={salesperson}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setSalesperson, setValidationErrors, {
            min: 0,
            max: 80,
            required: false,
          });
        }}
        disabled={!userCanEditSupplier}
        className={!userCanEditSupplier ? "bg-blue-50!" : ""}
      />
      {children}
    </form>
  );
}
