import { Input } from "@elements/Input";
import type { QuotationItemsType } from "../Quotations";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { BrlStringFromCents } from "@utils/formating";

interface ComponentProps {
  itemsList: Partial<QuotationItemsType>[];
  setItemsList: Dispatch<StateUpdater<Partial<QuotationItemsType>[]>>;
  setIsThereError: (bool: boolean) => void;
}

export function InventoryItemsList({
  itemsList,
  setIsThereError,
  setItemsList,
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

  function handleDeleteItem({
    createdAt,
    matId,
  }: {
    createdAt: string;
    matId: string;
  }) {
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
      ...prev.filter((item) => item.created_at == createdAt),
    ]);
  }

  function handleUpdateItemInt({
    value,
    propName,
    createdAt,
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
      })
    );
  }

  function handleUpdateItemCurrency({
    index,
    value,
    propName,
  }: {
    index: number;
    value: string;
    propName: string;
  }) {
    value = value
      .replace("R$", "")
      .trim()
      .replaceAll(".", "")
      .replaceAll(",", ".");
    if (isNaN(parseFloat(value || "0"))) {
      setValidationErrors((prev) => ({
        ...prev,
        [`${propName}-${index}`]: "Digite um valor válido",
      }));
    } else {
      setValidationErrors((prev) => {
        delete prev[`${propName}-${index}`];
        return { ...prev };
      });
    }
    setItems((prev) =>
      prev.map((item, i) => {
        if (i == index) {
          return {
            ...item,
            [propName]: Math.round(parseFloat(value || "0") * 100),
          };
        } else {
          return item;
        }
      })
    );
  }

  return (
    <div className={"px-2 flex flex-col gap-4 pb-3"}>
      <header className={"grid grid-cols-4 font-semibold"}>
        <div className={"col-span-2"}>
          <span className={"block -mb-2"}>Material</span>
        </div>
        <div>Valor unitário</div>
        <div>Quantidade prevista</div>
      </header>

      {items.map((item, index) => {
        if (item == undefined) {
          return <></>;
        }
        return (
          <div
            key={item.created_at}
            className={"grid grid-cols-4 items-center"}
          >
            <span className={"col-span-2"}>{item.name}</span>
            <Input
              name={`unit_value-${index}`}
              value={BrlStringFromCents(item.unit_value)}
              onBlur={(e) => {
                const value = e.currentTarget.value;
                handleUpdateItemCurrency({
                  value,
                  index,
                  propName: "unit_value",
                });
              }}
              errors={validationErrors}
              className={"min-w-5 mr-10"}
            />
            <div className={"flex gap-2 items-center justify-stretch"}>
              <Input
                label=""
                name={`expected_amount-${index}`}
                value={item.expected_amount}
                onBlur={(e) => {
                  const value = e.currentTarget.value;
                  handleUpdateItemInt({
                    value,
                    createdAt: item.created_at!,
                    propName: "expected_amount",
                  });
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
                    handleDeleteItem({
                      createdAt: item.created_at!,
                      matId: item.material_id || "",
                    });
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
