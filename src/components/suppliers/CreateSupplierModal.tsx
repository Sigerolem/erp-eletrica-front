import { z } from "astro/zod";
import type { TargetedSubmitEvent } from "preact";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { Input } from "src/elements/Input";
import { fetchWithToken } from "src/utils/fetchWithToken";
import type { SuppliersType } from "./Suppliers";

export function CreateSupplierModal({
  closeModal,
  setSupplier,
}: {
  closeModal: () => void;
  setSupplier: Dispatch<StateUpdater<SuppliersType[]>>;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [supplierSelected, setSupplierSelected] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as {
      name: string;
      cnpj: string;
      email: string;
      phoneNumber: string;
      mobileNumber: string;
      address: string;
      salesperson: string;
    };

    const {
      name,
      address,
      cnpj,
      email,
      mobileNumber,
      phoneNumber,
      salesperson,
    } = formData;

    const newErrors = validationErrors;

    if (name.length < 4 || name.length > 100) {
      newErrors.name = "O nome do fornecedor deve ter entre 3 e 100 letras.";
    } else {
      delete newErrors.name;
    }

    if (cnpj.length < 4 || cnpj.length > 20) {
      newErrors.cnpj =
        "O campo cnpj/cpf deve ser preenchido e ter no maximo 20 digitos.";
    } else {
      delete newErrors.cnpj;
    }

    if (email.length > 50) {
      newErrors.email = "O campo de email deve ter menos de 50 letras.";
    } else {
      delete newErrors.email;
    }

    if (phoneNumber.length > 15) {
      newErrors.phoneNumber =
        "O campo de telefone deve ter menos de 15 digitos.";
    } else {
      delete newErrors.phoneNumber;
    }

    if (mobileNumber.length > 15) {
      newErrors.mobileNumber =
        "O campo de celular deve ter menos de 15 digitos.";
    } else {
      delete newErrors.mobileNumber;
    }

    if (address.length > 150) {
      newErrors.address = "O campo de endereço deve ter menos de 150 digitos.";
    } else {
      delete newErrors.address;
    }

    if (salesperson.length > 80) {
      newErrors.salesperson = "O campo de vendedor deve menos de 80 digitos.";
    } else {
      delete newErrors.salesperson;
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors({ ...newErrors });
    } else {
      setValidationErrors({ ...newErrors });
      const { code, data } = await fetchWithToken<SuppliersType>({
        path: "/suppliers/create",
        method: "POST",
        body: JSON.stringify({
          name,
          cnpj,
          email: email || null,
          phone_number: phoneNumber || null,
          mobile_number: mobileNumber || null,
          address: address || null,
          salesperson: salesperson || null,
        }),
      });

      if (code == 409) {
        if (data.error.includes("entity.name")) {
          setValidationErrors((prev) => ({
            ...prev,
            name: "Esse nome já foi utilizado",
          }));
        } else if (data.error.includes("entity.cnpj")) {
          setValidationErrors((prev) => ({
            ...prev,
            cnpj: "Esse CNPJ já foi cadastrado",
          }));
        }
      }

      if (code == 201) {
        setSupplier((prev) => [data, ...prev]);
        closeModal();
      } else {
        console.error(code, data);
      }
    }
  }

  return (
    <section
      className={"absolute top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-10"}
      onClick={() => {
        closeModal();
      }}
    >
      <div
        className={"bg-blue-50 p-8 opacity-100 rounded-md"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={"flex justify-between mb-4"}>
          <h2 className={"text-3xl font-semibold"}>
            Cadastrar novo fornecedor
          </h2>
          <button
            className={"bg-red-700 p-2 rounded-md font-semibold text-white"}
            onClick={() => {
              closeModal();
            }}
          >
            Cancelar
          </button>
        </header>
        <div>
          <form onSubmit={onFormSubmit} className={"flex flex-col gap-2 w-ful"}>
            <Input
              label="Nome do fornecedor"
              name="name"
              errors={validationErrors}
            />
            <div className={"flex gap-4"}>
              <Input label="CNPJ/CPF" name="cnpj" errors={validationErrors} />
              <Input label="E-mail" name="email" errors={validationErrors} />
            </div>
            <div className={"flex gap-4"}>
              <Input
                label="Telefone"
                name="phoneNumber"
                errors={validationErrors}
              />
              <Input
                label="Celular"
                name="mobileNumber"
                errors={validationErrors}
              />
            </div>
            <Input
              label="Endereço"
              name="address"
              type="text"
              errors={validationErrors}
              className={""}
            />
            <Input
              label="Vendedor / Representante"
              name="salesperson"
              type="text"
              errors={validationErrors}
              className={""}
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
        </div>
      </div>
    </section>
  );
}
