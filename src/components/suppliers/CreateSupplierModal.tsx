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
import { SupplierDataForm } from "./SupplierDataForm";

export function CreateSupplierModal({
  closeModal,
  setSupplier,
}: {
  closeModal: () => void;
  setSupplier: Dispatch<StateUpdater<SuppliersType[]>>;
}) {
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

  async function handleDataSubmition(supplierData: Omit<SuppliersType, "id">) {
    const { code, data } = await fetchWithToken<{ supplier: SuppliersType }>({
      path: "/suppliers/create",
      method: "POST",
      body: JSON.stringify(supplierData),
    });

    if (code == 409) {
      let errors = {} as { [key: string]: string };
      if (data.error.includes("entity.name")) {
        errors = { ...errors, name: "Esse nome já foi utilizado" };
      } else if (data.error.includes("entity.cnpj")) {
        errors = { ...errors, cnpj: "Esse CNPJ já foi cadastrado" };
      }
      return errors;
    }

    if (code == 400) {
      window.alert("Requisição feita ao servidor é inválida.");
      console.error(code, data);
    }

    if (code == 201) {
      setSupplier((prev) => [data.supplier, ...prev]);
      closeModal();
    } else {
      console.error(code, data);
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
          <SupplierDataForm doOnSubmit={handleDataSubmition} />
        </div>
      </div>
    </section>
  );
}
