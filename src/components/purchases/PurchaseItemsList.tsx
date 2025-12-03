import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { PurchaseItemsType, PurchasesType } from "./Purchases";
import { Input } from "@elements/Input";
import { Button } from "@elements/Button";

export function PurchaseItemsList({
  purchaseItems,
  setPurchaseItems,
  setItemsWereChanged,
  purchase,
}: {
  purchase: Partial<PurchasesType>;
  purchaseItems: Partial<PurchaseItemsType>[];
  setPurchaseItems: Dispatch<StateUpdater<Partial<PurchaseItemsType>[]>>;
  setItemsWereChanged: Dispatch<StateUpdater<boolean>>;
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
    setItemsWereChanged(true);
  }

  function handleUpdateDeliveredAmount(materialId: string, amount: number) {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material_id == materialId) {
          return { ...item, amount_delivered: amount };
        } else {
          return { ...item };
        }
      })
    );
    setItemsWereChanged(true);
  }

  function handleRemoveItem(materialId: string) {
    setPurchaseItems((prev) =>
      prev.filter((item) => item.material_id !== materialId)
    );
    setItemsWereChanged(true);
  }

  const wasReceived =
    purchase?.status == "received" || purchase?.status == "finished";
  return (
    <div className={"px-2 flex flex-col gap-4 pb-3 pr-4"}>
      <header className={"grid grid-cols-5 font-semibold gap-x-4"}>
        <span className={"col-span-2"}>Item</span>
        {!wasReceived && <span>Atual/Ideal</span>}
        <span>Embalagem</span>
        <span>Solicitado</span>
        {wasReceived && <span>Recebido</span>}
      </header>

      {purchaseItems.map((item) => {
        if (item.material == undefined) {
          return;
        }
        return (
          <div className={"grid grid-cols-5 items-center gap-x-4"}>
            <span className={"col-span-2"}>{item.material.name}</span>
            {!wasReceived && (
              <span>
                {item.material.current_amount}
                {" / "}
                {item.material.ideal_amount}
              </span>
            )}
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
              {!wasReceived && (
                <div className={"ml-1 pr-4"}>
                  <Button
                    text="X"
                    className={"bg-red-600 py-1 text-white"}
                    onClick={() => {
                      handleRemoveItem(item.material_id || "");
                    }}
                  />
                </div>
              )}
            </div>
            {wasReceived && (
              <Input
                label=""
                name={`${item.material_id}-delivered`}
                value={item.amount_delivered ?? 0}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  if (isNaN(parseInt(value))) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [`${item.material_id}-delivered` || ""]:
                        "Digite um valor válido",
                    }));
                  } else {
                    setValidationErrors((prev) => {
                      delete prev[item.material_id || ""];
                      return { ...prev };
                    });
                  }
                  handleUpdateDeliveredAmount(
                    item.material_id || "",
                    parseInt(value)
                  );
                }}
                errors={validationErrors}
                className={"min-w-5"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
