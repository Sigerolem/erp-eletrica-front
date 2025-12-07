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
}

export function ExceptionalItemsList({
  itemsList,
  setIsThereError,
  setItemsList,
  type = "occasional_material",
  deleteItem,
  quotation,
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
    created_at,
    value,
    propName,
  }: {
    created_at: string;
    value: string;
    propName: string;
  }) {
    if (isNaN(parseInt(value || "0"))) {
      setValidationErrors((prev) => ({
        ...prev,
        [`${propName}-${created_at}`]: "Digite um valor válido",
      }));
    } else {
      setValidationErrors((prev) => {
        delete prev[`${propName}-${created_at}`];
        return { ...prev };
      });
    }
    setItemsList((prev) =>
      prev.map((item) => {
        if (item.created_at == created_at) {
          return { ...item, [propName]: parseInt(value || "0") };
        } else {
          return item;
        }
      })
    );
  }

  function handleUpdateItemCurrency({
    value,
    propName,
    created_at,
  }: {
    value: string;
    propName: "unit_cost" | "unit_value" | "unit_profit";
    created_at: string;
  }) {
    handleUpdateListItemValues({
      value,
      propName,
      created_at,
      itemsList,
      setItemsList,
      setValidationErrors,
    });
  }

  const xSize = window.innerWidth;

  window.alert(xSize);
  return (
    <div className={"px-2 pb-3"}>
      <header className={"grid grid-cols-8 gap-x-4 font-semibold"}>
        <span className={"col-span-3"}>Nome/Descrição</span>
        <span>Unidade</span>
        <span>Custo unitário</span>
        <span>Margem de lucro</span>
        <span>Valor unitário</span>
        <span>Quantidade prevista</span>
      </header>

      {items.map((item) => {
        if (item == undefined) {
          return <></>;
        }
        return (
          <div
            key={item.created_at}
            className={"grid grid-cols-8 gap-x-4 items-center"}
          >
            <div className={"col-span-3"}>
              <Input
                name={`name-${item.created_at}`}
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
            />
            <Input
              name={`unit_cost-${item.created_at}`}
              value={BrlStringFromCents(item.unit_cost)}
              onBlur={(e) => {
                const value = e.currentTarget.value;
                handleUpdateItemCurrency({
                  value,
                  propName: "unit_cost",
                  created_at: item.created_at!,
                });
              }}
              errors={validationErrors}
              className={"min-w-5"}
            />
            <Input
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
                  created_at: item.created_at!,
                });
              }}
              errors={validationErrors}
              className={"min-w-5"}
            />
            <Input
              name={`unit_value-${item.created_at}`}
              value={BrlStringFromCents(item.unit_value)}
              onBlur={(e) => {
                const value = e.currentTarget.value;
                handleUpdateItemCurrency({
                  value,
                  propName: "unit_value",
                  created_at: item.created_at!,
                });
              }}
              errors={validationErrors}
              className={"min-w-5"}
            />

            <div className={"flex gap-2 items-center justify-stretch"}>
              <Input
                label=""
                name={`expected_amount-${item.created_at}`}
                value={item.expected_amount}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  handleUpdateItemInt({
                    value,
                    propName: "expected_amount",
                    created_at: item.created_at!,
                  });
                }}
                errors={validationErrors}
                className={"min-w-4"}
              />
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
