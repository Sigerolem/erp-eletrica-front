import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { fetchWithToken } from "src/utils/fetchWithToken";
import type { PurchasesType } from "./Purchases";
import { PurchaseDataForm } from "./PurchaseDataForm";
import { Button } from "@elements/Button";
import type { SuppliersType } from "@comp/suppliers/Suppliers";

export function CreatePurchaseModal({
  closeModal,
  setPurchases,
}: {
  closeModal: () => void;
  setPurchases: Dispatch<StateUpdater<PurchasesType[]>>;
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

  async function onFormSubmit(purchaseData: Partial<PurchasesType>) {
    const basicSupplier = purchaseData.supplier as SuppliersType;
    delete purchaseData.supplier;
    const { data, code } = await fetchWithToken<{ purchase: PurchasesType }>({
      path: "/purchases/create",
      method: "POST",
      body: JSON.stringify(purchaseData),
    });

    if (code == 201) {
      const purchase = data.purchase;
      setPurchases((prev) => [
        {
          ...purchase,
          supplier: basicSupplier,
        },
        ...prev,
      ]);
      closeModal();
      return null;
    }

    window.alert("Erro ao salvar a compra");
    console.error(code, data, purchaseData);
    return { erro: "Algum problema ocorreu" };
  }

  return (
    <section
      className={
        "absolute top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-10 flex flex-col justify-center"
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
          <h2 className={"text-3xl font-semibold"}>Novo pedido de compra</h2>
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
          <PurchaseDataForm doOnSubmit={onFormSubmit}>
            <div className={"w-full justify-stretch flex"}>
              <Button
                text={"salvar"}
                type={"submit"}
                className={"bg-blue-700 flex-1"}
              />
            </div>
          </PurchaseDataForm>
        </div>
      </div>
    </section>
  );
}
