import { Button } from "@elements/Button";
import { Input } from "@elements/Input";
import { UnitSelector } from "@elements/UnitSelector";
import { BrlStringFromCents } from "@utils/formating";
import { handleUpdateListItemValues } from "@utils/inputHandling";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type {
  QuotationItemsType,
  QuotationItemTypeType,
  QuotationsType,
} from "../Quotations";

interface ComponentProps {
  itemsList: Partial<QuotationItemsType>[];
  setItemsList: Dispatch<StateUpdater<Partial<QuotationItemsType>[]>>;
  setIsThereError: (bool: boolean) => void;
  type?: QuotationItemTypeType;
  deleteItem: Dispatch<StateUpdater<string[]>>;
  quotation?: QuotationsType;
  readOnly?: boolean;
}

export function ExceptionalItemsList({
  itemsList,
  setIsThereError,
  setItemsList,
  type = "occasional_material",
  deleteItem,
  quotation,
  readOnly,
}: ComponentProps) {
  const [items, setItems] = useState<Partial<QuotationItemsType>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (Object.keys(validationErrors).length == 0) {
      setIsThereError(false);
    } else {
      setIsThereError(true);
    }
  }, [validationErrors]);

  useEffect(() => {
    setItems(itemsList);
  }, [itemsList]);

  function handleDeleteItem({ createdAt }: { createdAt: string }) {
    const errors = Object.keys(validationErrors);
    errors.forEach((error) => {
      if (error.includes(`-${createdAt}`)) {
        setValidationErrors((prev) => {
          delete prev[error];
          return prev;
        });
      }
    });
    setItemsList((prev) => [
      ...prev.filter((item) => createdAt !== item.created_at),
    ]);
  }

  function handleUpdateItemInt({
    createdAt,
    value,
    propName,
  }: {
    createdAt: string;
    value: string;
    propName: string;
  }) {
    if (isNaN(parseInt(value || "0"))) {
      setValidationErrors((prev) => ({
        ...prev,
        [`${propName}-${createdAt}`]: "Digite um valor válido",
      }));
    } else {
      setValidationErrors((prev) => {
        delete prev[`${propName}-${createdAt}`];
        return { ...prev };
      });
    }
    setItemsList((prev) =>
      prev.map((item) => {
        if (item.created_at == createdAt) {
          return { ...item, [propName]: parseInt(value || "0") };
        } else {
          return item;
        }
      }),
    );
  }
  const xSize = window.innerWidth;

  function handleUpdateItemCurrency({
    value,
    propName,
    createdAt,
  }: {
    value: string;
    propName: "unit_cost" | "unit_value" | "unit_profit";
    createdAt: string;
  }) {
    handleUpdateListItemValues({
      value,
      propName,
      createdAt,
      itemsList,
      setItemsList,
      setValidationErrors,
    });
  }

  return (
    <div className={"px-2 flex flex-col gap-3 pb-3"}>
      {xSize >= 1000 && (
        <header className={"grid grid-cols-8 gap-x-4 font-semibold"}>
          <span className={"col-span-3"}>Nome/Descrição</span>
          <span>Unidade</span>
          <span>Custo unitário</span>
          <span>Margem de lucro</span>
          <span>Valor unitário</span>
          <span>Quantidade</span>
        </header>
      )}

      {items.toReversed().map((item, index) => {
        if (item == undefined) {
          return <></>;
        }
        return (
          <div
            key={item.id ?? item.created_at ?? ""}
            className={`grid gap-x-4 items-end ${
              xSize < 1000 ? "grid-cols-4" : "grid-cols-8"
            } ${index > 0 && "border-t border-gray-400"}`}
          >
            <div className={"col-span-3 pt-2"}>
              <Input
                label={xSize < 1000 ? "Nome" : ""}
                name={`name-${item.id}`}
                value={item.name}
                onBlur={(e) => {
                  setItemsList((prev) => [
                    ...prev.map((mapItem) => {
                      if (item.created_at == mapItem.created_at) {
                        return { ...mapItem, name: e.currentTarget.value };
                      } else {
                        return { ...mapItem };
                      }
                    }),
                  ]);
                }}
                disabled={readOnly}
                className={readOnly ? "bg-blue-50!" : ""}
              />
            </div>
            <UnitSelector
              value={item.unit!}
              type={type.includes("service") ? "service" : "material"}
              doOnSelect={(value) => {
                setItemsList((prev) => [
                  ...prev.map((mapItem) => {
                    if (item.created_at == mapItem.created_at) {
                      return { ...mapItem, unit: value };
                    } else {
                      return { ...mapItem };
                    }
                  }),
                ]);
              }}
              disabled={readOnly}
            />
            <div
              className={
                xSize < 500
                  ? "col-span-4 flex gap-2 mt-3"
                  : "col-span-2 flex gap-2 mt-3"
              }
            >
              <Input
                name={`unit_cost-${item.created_at}`}
                label={xSize < 1000 ? "Custo Unit." : ""}
                value={BrlStringFromCents(item.unit_cost)}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  handleUpdateItemCurrency({
                    value,
                    propName: "unit_cost",
                    createdAt: item.created_at!,
                  });
                }}
                errors={validationErrors}
                className={readOnly ? "min-w-5 bg-blue-50!" : "min-w-5"}
                disabled={readOnly}
              />
              <Input
                label={xSize < 1000 ? "Lucro" : ""}
                name={`unit_profit-${item.created_at}`}
                value={`${(item.unit_profit! / 100)
                  .toFixed(2)
                  .replaceAll(",", "")
                  .replaceAll(".", ",")} %`}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  handleUpdateItemCurrency({
                    value,
                    propName: "unit_profit",
                    createdAt: item.created_at!,
                  });
                }}
                errors={validationErrors}
                className={readOnly ? "min-w-5 bg-blue-50!" : "min-w-5"}
                disabled={readOnly}
              />
            </div>
            <div
              className={
                xSize < 500
                  ? "col-span-4 grid grid-cols-2 mt-3 gap-2 items-end"
                  : "col-span-2 grid grid-cols-2 mt-3 gap-2 items-end"
              }
            >
              <Input
                name={`unit_value-${item.created_at}`}
                label={xSize < 1000 ? "Valor Unit." : ""}
                value={BrlStringFromCents(item.unit_value)}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  handleUpdateItemCurrency({
                    value,
                    propName: "unit_value",
                    createdAt: item.created_at!,
                  });
                }}
                errors={validationErrors}
                className={readOnly ? "min-w-5 bg-blue-50!" : "min-w-5"}
                disabled={readOnly}
              />

              <div className={"flex gap-2 items-end justify-stretch"}>
                <Input
                  label={xSize < 1000 ? "Qtd. Eesperada" : ""}
                  name={`expected_amount-${item.created_at}`}
                  value={item.expected_amount}
                  onBlur={(e) => {
                    const value = e.currentTarget.value;
                    handleUpdateItemInt({
                      value,
                      propName: "expected_amount",
                      createdAt: item.created_at!,
                    });
                  }}
                  errors={validationErrors}
                  className={readOnly ? "min-w-4 bg-blue-50!" : "min-w-4"}
                  disabled={readOnly}
                />
                {!readOnly && (
                  <Button
                    text="X"
                    className={"bg-red-600 py-1 text-white"}
                    onClick={() => {
                      if (item.id) {
                        deleteItem((prev) => [...prev, item.id!]);
                      }
                      handleDeleteItem({ createdAt: item.created_at! });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
