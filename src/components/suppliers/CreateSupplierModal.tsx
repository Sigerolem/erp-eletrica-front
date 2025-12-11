import { useEffect, type Dispatch, type StateUpdater } from "preact/hooks";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { SupplierDataForm } from "./SupplierDataForm";
import type { SuppliersType } from "./Suppliers";
import { Button } from "@elements/Button";

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
      if (data.message.includes("entity.name")) {
        errors = { ...errors, name: "Esse nome já foi utilizado" };
      } else if (data.message.includes("entity.cnpj")) {
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
      className={
        "absolute top-0 left-0 w-full h-full md:p-10 not-md:p-6 bg-[#000000AA] z-10 flex flex-col justify-center"
      }
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
          <Button
            text="Cancelar"
            className={"bg-red-700 text-white"}
            onClick={() => {
              closeModal();
            }}
          />
        </header>
        <div>
          <SupplierDataForm doOnSubmit={handleDataSubmition}>
            <Button type={"submit"} text="Salvar" />
          </SupplierDataForm>
        </div>
      </div>
    </section>
  );
}
