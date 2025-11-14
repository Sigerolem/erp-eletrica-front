import type { QuotationItemsType } from "@comp/quotations/Quotations";
import type { Dispatch, StateUpdater } from "preact/hooks";
import { calculateProfit } from "./calculator";

export function handleUpdateListItemValues({
  value,
  propName,
  created_at,
  itemsList,
  setValidationErrors,
  setItemsList,
}: {
  value: string;
  propName: "unit_cost" | "unit_value" | "unit_profit";
  created_at: string;
  itemsList: Partial<QuotationItemsType>[];
  setItemsList: Dispatch<StateUpdater<Partial<QuotationItemsType>[]>>;
  setValidationErrors: Dispatch<StateUpdater<{ [key: string]: string }>>;
}) {
  value = value
    .replaceAll("R$", "")
    .replaceAll("%", "")
    .replaceAll(".", "")
    .replaceAll(",", ".")
    .trim();
  const oldItem = itemsList.find((item) => item.created_at == created_at)!;
  if (Math.round(parseFloat(value) * 100) == oldItem[propName]) {
    return;
  }
  if (
    isNaN(parseFloat(value || "0")) ||
    (propName == "unit_profit" &&
      Math.round(parseFloat(value || "0") * 100) > 10000)
  ) {
    setValidationErrors((prev) => ({
      ...prev,
      [`${propName}-${created_at}`]: "Digite um valor válido",
    }));
  } else {
    setValidationErrors((prev) => {
      delete prev[`${propName}-${created_at}`];
      return { ...prev };
    });
    let [newCost, newValue, newProfit] = [0, 0, 0];
    if (propName == "unit_cost") {
      newCost = Math.round(parseFloat(value || "0") * 100);
      newProfit = itemsList.find((item) => item.created_at == created_at)!
        .unit_profit!;
      newValue = calculateProfit({
        cost: newCost,
        profit: newProfit,
      }).value;
    } else if (propName == "unit_value") {
      newValue = Math.round(parseFloat(value || "0") * 100);
      newCost = itemsList.find((item) => item.created_at == created_at)!
        .unit_cost!;
      newProfit = calculateProfit({
        cost: newCost,
        value: newValue,
      }).profit;
    } else {
      newProfit = Math.round(parseFloat(value || "0") * 100);
      if (newProfit > 10000) {
        newProfit = 0;
      }
      if (newProfit > 9900) {
        newCost = 0;
        newValue = itemsList.find((item) => item.created_at == created_at)!
          .unit_value!;
      } else {
        newCost = itemsList.find((item) => item.created_at == created_at)!
          .unit_cost!;
        newValue = calculateProfit({
          cost: newCost,
          profit: newProfit,
        }).value;
      }
    }
    setItemsList((prev) =>
      prev.map((item) => {
        if (item.created_at == created_at) {
          return {
            ...item,
            unit_cost: newCost,
            unit_profit: newProfit,
            unit_value: newValue,
          };
        } else {
          return item;
        }
      })
    );
  }
}
