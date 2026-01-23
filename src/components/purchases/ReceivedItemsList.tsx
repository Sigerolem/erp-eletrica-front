import { Input } from "@elements/Input";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { PurchaseItemsType, PurchasesType } from "./Purchases";
import { BrlStringFromCents } from "src/utils/formating";

export function ReceivedItemsList({
  purchase,
  purchaseItems,
  setPurchaseItems,
  setItemsWereChanged,
}: {
  purchase: PurchasesType;
  purchaseItems: PurchaseItemsType[];
  setPurchaseItems: Dispatch<StateUpdater<Partial<PurchaseItemsType>[]>>;
  setItemsWereChanged: Dispatch<StateUpdater<boolean>>;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    console.log("refresh");
  }, [purchaseItems]);

  return (
    <div className={"px-2 flex flex-col gap-4 pb-3 pr-4"}>
      {purchaseItems.map((item) => {
        let totalVal = item.amount_delivered * item.new_unit_cost;
        let deliveryShare = Math.round(
          purchase.delivery_cost *
            (totalVal / (purchase.purchase_cost - purchase.delivery_cost)),
        );
        deliveryShare = isNaN(deliveryShare) ? 0 : deliveryShare;
        console.log(
          totalVal,
          deliveryShare,
          purchase.delivery_cost,
          totalVal / (purchase.purchase_cost - purchase.delivery_cost),
        );
        const newUnitVal = Math.round(
          item.new_unit_cost + deliveryShare / (item.amount_delivered || 1),
        );
        const amountInStock =
          item.material.current_amount > 0 ? item.material.current_amount : 0;
        const dilutedCost =
          (newUnitVal * item.amount_delivered +
            amountInStock * item.material.avg_cost) /
          (item.amount_delivered + amountInStock);
        if (item.material == undefined) {
          return;
        }
        return (
          <article
            key={item.material_id}
            className={`grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)] gap-x-2 gap-y-1 p-2 py-3 items-center not-first:border-t border-gray-600`}
          >
            <div className={"sm:col-span-4 col-span-1"}>
              <Input
                label=""
                name={"name"}
                value={item.material.name}
                disabled={true}
                className={"bg-blue-50!"}
              />
            </div>
            <div className={"flex sm:flex-col gap-1"}>
              <Input
                label={"Entregue"}
                name={`amountDelivered`}
                value={item.amount_delivered}
                className={"text-center font-semibold"}
                onBlur={(e) => {
                  if (e.currentTarget.value.length > 7) {
                    e.currentTarget.value = item.amount_delivered.toString();
                    return;
                  }
                  let val = parseInt(e.currentTarget.value);
                  if (isNaN(val)) {
                    val = 0;
                  }
                  setPurchaseItems((prev) => [
                    ...prev.map((pItem) =>
                      pItem.material_id == item.material_id
                        ? { ...pItem, amount_delivered: val }
                        : pItem,
                    ),
                  ]);
                }}
              />
              <Input
                label={"Pedido"}
                name={`amountRequested`}
                value={`${item.amount_requested} ${item.material.unit}`}
                className={"bg-blue-50! text-center font-semibold"}
                disabled={true}
              />
              <Input
                label={"Disponível"}
                name={`available`}
                value={`${item.material.current_amount - item.material.reserved_amount} ${item.material.unit}`}
                className={"bg-blue-50! text-center font-semibold"}
                disabled={true}
              />
            </div>
            <div className={"flex sm:flex-col gap-1"}>
              <Input
                label={"Custo s/ IPI"}
                name={`amountDelivered`}
                value={BrlStringFromCents(item.new_clean_cost)}
                onBlur={(e) => {
                  let val = parseFloat(
                    e.currentTarget.value
                      .replaceAll("R$", "")
                      .replaceAll(".", "")
                      .replaceAll(",", ".")
                      .trim(),
                  );
                  if (isNaN(val)) {
                    val = 0;
                  }
                  val = Math.round(val * 100);
                  setPurchaseItems((prev) => [
                    ...prev.map((pItem) =>
                      pItem.material_id == item.material_id
                        ? {
                            ...pItem,
                            new_clean_cost: val,
                            new_unit_cost: val * (pItem.ipi! / 100_00) + val,
                          }
                        : pItem,
                    ),
                  ]);
                }}
              />
              <Input
                label={"Custo c/ IPI"}
                name={`totalValue`}
                value={BrlStringFromCents(item.new_unit_cost)}
                className={"bg-blue-50!"}
                disabled={true}
              />
              <Input
                label={"Novo custo"}
                name={`totalValue`}
                value={BrlStringFromCents(newUnitVal)}
                className={"bg-blue-50!"}
                disabled={true}
              />
            </div>
            <div className={"flex sm:flex-col gap-1"}>
              <Input
                label={"Taxa IPI"}
                name={`ipi`}
                value={(item.ipi / 100_00).toLocaleString("pt-br", {
                  style: "percent",
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })}
                onBlur={(e) => {
                  let val = parseFloat(
                    e.currentTarget.value
                      .replaceAll("%", "")
                      .replaceAll(".", "")
                      .replaceAll(",", ".")
                      .trim(),
                  );
                  if (isNaN(val)) {
                    val = 0;
                  }
                  val = Math.round(val * 100);
                  setPurchaseItems((prev) => [
                    ...prev.map((pItem) =>
                      pItem.material_id == item.material_id
                        ? {
                            ...pItem,
                            ipi: val,
                            new_unit_cost:
                              pItem.new_clean_cost! * (val / 100_00) +
                              pItem.new_clean_cost!,
                          }
                        : pItem,
                    ),
                  ]);
                }}
              />
              <Input
                label={"Valor IPI"}
                name={`ipiValue`}
                value={BrlStringFromCents(
                  item.new_unit_cost - item.new_clean_cost,
                )}
                className={"bg-blue-50!"}
                disabled={true}
              />
              <Input
                label={"Total c/ IPI"}
                name={`ipiValue`}
                value={BrlStringFromCents(totalVal)}
                className={"bg-blue-50!"}
                disabled={true}
              />
            </div>
            <div className={"flex sm:flex-col gap-1"}>
              <Input
                label={"Lucro"}
                name={`ipi`}
                value={(
                  (item.profit ?? item.material.profit) / 100_00
                ).toLocaleString("pt-br", {
                  style: "percent",
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })}
                onBlur={(e) => {
                  let val = parseFloat(
                    e.currentTarget.value
                      .replaceAll("%", "")
                      .replaceAll(".", "")
                      .replaceAll(",", ".")
                      .trim(),
                  );
                  if (isNaN(val)) {
                    val = 0;
                  }
                  val = Math.round(val * 100);
                  setPurchaseItems((prev) => [
                    ...prev.map((pItem) =>
                      pItem.material_id == item.material_id
                        ? { ...pItem, profit: val }
                        : pItem,
                    ),
                  ]);
                  setItemsWereChanged(true);
                }}
              />
              <Input
                label={"Custo diluído"}
                name={`ipiValue`}
                value={BrlStringFromCents(dilutedCost)}
                className={"bg-blue-50!"}
                disabled={true}
              />
              <Input
                label={"Novo valor"}
                name={`ipiValue`}
                value={BrlStringFromCents(
                  (dilutedCost * 100_00) /
                    (100_00 - (item.profit ?? item.material.profit)),
                )}
                className={"bg-blue-50! font-semibold"}
                disabled={true}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
