import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { PurchaseItemsType } from "./Purchases";
import { Input } from "@elements/Input";

export function PurchaseItemsList({
  purchaseItems,
  setPurchaseItems,
}: {
  purchaseItems: Partial<PurchaseItemsType>[];
  setPurchaseItems: Dispatch<StateUpdater<Partial<PurchaseItemsType>[]>>;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  function handleUpdateRequestedAmount(materialId: string, amount: number) {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material_id == materialId) {
          return { ...item, amount_requested: amount };
        } else {
          return { ...item };
        }
      })
    );
  }

  function handleRemoveItem(materialId: string) {
    setPurchaseItems((prev) =>
      prev.filter((item) => item.material_id !== materialId)
    );
  }

  return (
    <div className={"px-4 flex flex-col gap-4 pb-3"}>
      <header className={"grid grid-cols-5 font-semibold"}>
        <span className={"col-span-2"}>Item</span>
        <span>Atual/Ideal</span>
        <span>Embalagem</span>
        <span>Comprar</span>
      </header>

      {purchaseItems.map((item) => {
        if (item.material == undefined) {
          return;
        }
        return (
          <div className={"grid grid-cols-5 items-center"}>
            <span className={"col-span-2"}>{item.material.name}</span>
            <span>
              {item.material.current_amount}
              {" / "}
              {item.material.ideal_amount}
            </span>
            <span>{item.material.pkg_size}</span>
            <div className={"flex gap-2 items-center justify-stretch"}>
              <Input
                label=""
                name={item.material.id}
                value={item.amount_requested ?? 0}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  if (isNaN(parseInt(value))) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [item.material_id || ""]: "Digite um valor válido",
                    }));
                  } else {
                    setValidationErrors((prev) => {
                      delete prev[item.material_id || ""];
                      return { ...prev };
                    });
                  }
                  handleUpdateRequestedAmount(
                    item.material_id || "",
                    parseInt(value)
                  );
                }}
                errors={validationErrors}
                className={"min-w-5"}
              />
              <div className={"ml-1"}>
                <button
                  className={
                    "bg-red-600 px-1 rounded-md text-white font-semibold text-sm shadow-md"
                  }
                  type={"button"}
                  onClick={() => {
                    handleRemoveItem(item.material_id || "");
                  }}
                >
                  X
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
