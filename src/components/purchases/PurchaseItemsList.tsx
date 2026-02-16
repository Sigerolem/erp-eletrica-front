import { Button } from "@elements/Button";
import { Input } from "@elements/Input";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { PurchaseItemsType, PurchasesType } from "./Purchases";
import { hasPermission } from "@utils/permissionLogic";

export function PurchaseItemsList({
  purchaseItems,
  setPurchaseItems,
  setItemsWereChanged,
  purchase,
}: {
  purchase: Partial<PurchasesType>;
  purchaseItems: Partial<PurchaseItemsType>[];
  setPurchaseItems: Dispatch<StateUpdater<Partial<PurchaseItemsType>[]>>;
  setItemsWereChanged?: Dispatch<StateUpdater<boolean>>;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [userCanEditPurchase, setUserCanEditPurchase] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "purchase", "W")
    ) {
      setUserCanEditPurchase(true);
    }
  }, []);

  function handleUpdateRequestedAmount(materialId: string, amount: number) {
    let old: number;
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material_id == materialId) {
          item.amount_requested != amount &&
            setItemsWereChanged &&
            setItemsWereChanged(true);
          return { ...item, amount_requested: amount };
        } else {
          return { ...item };
        }
      }),
    );
  }

  function handleUpdateDeliveredAmount(materialId: string, amount: number) {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material_id == materialId) {
          return { ...item, amount_delivered: amount };
        } else {
          return { ...item };
        }
      }),
    );
    setItemsWereChanged && setItemsWereChanged(true);
  }

  function handleRemoveItem(materialId: string) {
    setPurchaseItems((prev) =>
      prev.filter((item) => item.material_id !== materialId),
    );
    setItemsWereChanged && setItemsWereChanged(true);
  }

  const wasReceived =
    purchase?.status == "received" || purchase?.status == "finished";

  const xSize = window.innerWidth;
  return (
    <div className={"px-2 flex flex-col gap-4 pb-3 pr-4"}>
      {/* <header className={"grid grid-cols-4 font-semibold gap-x-4"}>
        <span className={"col-span-2"}>Item</span>
        {!wasReceived && <span>Estoque</span>}
        <span>Solicitado</span>
        {wasReceived && <span>Recebido</span>}
      </header> */}

      {purchaseItems.map((item) => {
        if (item.material == undefined) {
          return;
        }
        return (
          <article
            className={"w-full grid grid-cols-4 items-center gap-x-2 gap-y-1"}
          >
            <div
              className={`${
                xSize < 500
                  ? "col-span-4"
                  : wasReceived
                    ? "col-span-3"
                    : "col-span-2"
              }`}
            >
              <Input
                name="name"
                label="Material"
                className={"bg-blue-50!"}
                value={item.material.name}
                disabled={true}
              />
              <div className={`${"flex gap-2"}`}>
                <Input
                  name="pkgSize"
                  label="Embalagem"
                  value={item.material.pkg_size}
                  className={"bg-blue-50!"}
                  disabled={true}
                />
                {wasReceived && (
                  <Input
                    name="idealAmount"
                    label="Ideal"
                    value={item.material.ideal_amount}
                    className={"bg-blue-50!"}
                    disabled={true}
                  />
                )}
                {xSize < 500 && (
                  <Input
                    name="currentAmount"
                    label="Disponível"
                    value={
                      item.material.current_amount -
                      item.material.reserved_amount
                    }
                    className={"bg-blue-50!"}
                    disabled={true}
                  />
                )}
              </div>
            </div>
            {!wasReceived && xSize >= 500 && (
              <div>
                <Input
                  name="currentAmount"
                  label="Disponível"
                  value={
                    item.material.current_amount - item.material.reserved_amount
                  }
                  className={"bg-blue-50!"}
                  disabled={true}
                />
                <Input
                  name="currentAmount"
                  label="Ideal"
                  value={item.material.ideal_amount}
                  className={"bg-blue-50!"}
                  disabled={true}
                />
              </div>
            )}
            <div
              className={`h-full flex ${
                xSize < 500
                  ? "items-end gap-4 col-span-4"
                  : "flex-col justify-between items-stretch"
              }`}
            >
              <Input
                label="Pedido"
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
                    parseInt(value),
                  );
                }}
                errors={validationErrors}
                disabled={wasReceived || !userCanEditPurchase}
                className={
                  wasReceived || !userCanEditPurchase ? "bg-blue-50!" : ""
                }
              />
              {wasReceived && (
                <Input
                  label="Recebido"
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
                      parseInt(value),
                    );
                  }}
                  disabled={
                    !userCanEditPurchase || purchase.status == "finished"
                  }
                  className={
                    !userCanEditPurchase || purchase.status == "finished"
                      ? "bg-blue-50! min-w-5"
                      : "min-w-5"
                  }
                  errors={validationErrors}
                />
              )}
              {!wasReceived && userCanEditPurchase && (
                <div className={"flex justify-end"}>
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
          </article>
        );
      })}
    </div>
  );
}
