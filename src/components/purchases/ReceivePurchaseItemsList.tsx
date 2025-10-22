import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { PurchaseItemsType } from "./Purchases";
import { Input } from "@elements/Input";
import { BrlStringFromCents } from "@utils/formating";
import { parseFloatFromString } from "@utils/inputValidation";

export function ReceivePurchaseItemsList({
  purchaseItems,
  setPurchaseItems,
}: {
  purchaseItems: Partial<PurchaseItemsType>[];
  setPurchaseItems: Dispatch<StateUpdater<Partial<PurchaseItemsType>[]>>;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  function handleUpdateRequestedAmount(
    materialId: string,
    amount: number,
    isDeliveryAmount?: boolean
  ) {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material_id == materialId) {
          if (isDeliveryAmount) {
            return { ...item, amount_delivered: amount };
          } else {
            return { ...item, amount_requested: amount };
          }
        } else {
          return { ...item };
        }
      })
    );
  }

  function handleUpdateNewCost(materialId: string, amount: number) {
    setPurchaseItems((prev) =>
      prev.map((item) => {
        if (item.material_id == materialId) {
          return { ...item, new_unit_cost: amount };
        } else {
          return { ...item };
        }
      })
    );
  }

  return (
    <div className={"px-2 flex flex-col gap-4 pb-3"}>
      <header className={"grid grid-cols-6 font-semibold"}>
        <div className={"col-span-2"}>
          <span className={"block -mb-2"}>Item/</span>
          <span>Cod. Barras</span>
        </div>
        <div>
          <span className={"block -mb-2"}>Custo Atual/</span>
          <span>Estoque Atual</span>
        </div>
        <div>Solicitado</div>
        <div>Recebido</div>
        <div>Novo Custo Unitário</div>
      </header>

      {purchaseItems.map((item) => {
        if (item.material == undefined) {
          return;
        }
        return (
          <div className={"grid grid-cols-6 items-center mb-2"}>
            <span className={"col-span-2"}>
              <span className={"block -mb-2"}>{item.material.name}</span>
              <strong className={"text-sm"}>
                {item.material.barcode || "sem código cadastrado"}
              </strong>
            </span>
            <span>
              {BrlStringFromCents(item.material.avg_cost)}
              <br />
              {item.material.current_amount}
            </span>
            <div className={"flex gap-2 items-center justify-stretch pr-4"}>
              <Input
                label=""
                name={`amountRequested-${item.material_id}`}
                value={item.amount_requested ?? 0}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  const { erro, intValue } = parseFloatFromString({
                    value,
                    options: {},
                    name: `amountRequested-${item.material_id}`,
                  });
                  setValidationErrors((prev) => {
                    delete prev[`amountRequested-${item.material_id}`];
                    return erro == null ? prev : { ...prev, ...erro };
                  });
                  handleUpdateRequestedAmount(item.material_id || "", intValue);
                }}
                errors={validationErrors}
                className={"min-w-5"}
              />
            </div>
            <div className={"flex gap-2 items-center justify-stretch pr-4"}>
              <Input
                label=""
                name={`amountDelivered-${item.material_id}`}
                value={item.amount_delivered ?? 0}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  const { intValue, erro } = parseFloatFromString({
                    value,
                    options: {},
                    name: `amountDelivered-${item.material_id}`,
                  });
                  setValidationErrors((prev) => {
                    delete prev[`amountDelivered-${item.material_id}`];
                    return erro == null ? prev : { ...prev, ...erro };
                  });
                  handleUpdateRequestedAmount(
                    item.material_id || "",
                    intValue,
                    true
                  );
                }}
                errors={validationErrors}
                className={"min-w-5"}
              />
            </div>
            <Input
              label=""
              name={`newCost-${item.material_id}`}
              className={"mr-4"}
              value={BrlStringFromCents(item.new_unit_cost || 0)}
              onBlur={(e) => {
                const value = e.currentTarget.value;
                const { centsValue, erro } = parseFloatFromString({
                  value,
                  options: { removeFromString: "R$" },
                  name: `newCost-${item.material_id}`,
                });
                setValidationErrors((prev) => {
                  delete prev[`newCost-${item.material_id}`];
                  return erro == null ? prev : { ...prev, ...erro };
                });
                handleUpdateNewCost(item.material_id || "", centsValue);
              }}
              errors={validationErrors}
            />
          </div>
        );
      })}
    </div>
  );
}
