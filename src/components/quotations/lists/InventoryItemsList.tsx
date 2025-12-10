import { Button } from "@elements/Button";
import { Input } from "@elements/Input";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { QuotationMaterialsType } from "../Quotations";

interface ComponentProps {
  itemsList: Partial<QuotationMaterialsType>[];
  setItemsList: Dispatch<StateUpdater<Partial<QuotationMaterialsType>[]>>;
  setIsThereError: (bool: boolean) => void;
  deleteItem: Dispatch<StateUpdater<string[]>>;
}

export function InventoryItemsList({
  itemsList,
  setIsThereError,
  setItemsList,
  deleteItem,
}: ComponentProps) {
  const [items, setItems] = useState<Partial<QuotationMaterialsType>[]>([]);
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

  function handleDeleteItem({ matId }: { matId: string }) {
    const errors = Object.keys(validationErrors);
    errors.forEach((error) => {
      if (error.includes(`-${matId}`)) {
        setValidationErrors((prev) => {
          delete prev[error];
          return prev;
        });
      }
    });
    setItemsList((prev) => [
      ...prev.filter((item) => item.material_id != matId),
    ]);
  }

  function handleUpdateItemInt({
    value,
    propName,
    material_id,
  }: {
    value: string;
    propName: string;
    material_id: string;
  }) {
    if (isNaN(parseInt(value || "0"))) {
      setValidationErrors((prev) => ({
        ...prev,
        [`${propName}-${material_id}`]: "Digite um valor válido",
      }));
    } else {
      setValidationErrors((prev) => {
        delete prev[`${propName}-${material_id}`];
        return { ...prev };
      });
    }
    setItemsList((prev) =>
      prev.map((item) => {
        if (item.material_id == material_id) {
          return { ...item, [propName]: parseInt(value || "0") };
        } else {
          return item;
        }
      })
    );
  }

  function handleUpdateItemCurrency({
    material_id,
    value,
    propName,
  }: {
    material_id: string;
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
        [`${propName}-${material_id}`]: "Digite um valor válido",
      }));
    } else {
      setValidationErrors((prev) => {
        delete prev[`${propName}-${material_id}`];
        return { ...prev };
      });
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.material_id == material_id) {
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
      {/* <header className={"grid grid-cols-4 font-semibold"}>
        <div className={"col-span-2"}>
          <span className={"block -mb-2"}>Material</span>
        </div>
        <div>Valor unitário</div>
        <div>Quantidade prevista</div>
      </header> */}

      {items.map((item) => {
        if (item == undefined) {
          return <></>;
        }
        return (
          <div
            key={`${item.created_at}-${item.material_id}`}
            className={"grid grid-cols-4 gap-4 items-end"}
          >
            <div className={"col-span-2"}>
              <Input
                label="Nome descritivo"
                name={`name-${item.material_id}`}
                value={item.name}
                disabled={true}
                className={"min-w-5 bg-blue-50!"}
              />
            </div>
            <Input
              label="Quantidade esperada"
              name={`expected_amount-${item.material_id}`}
              value={item.expected_amount}
              onBlur={(e) => {
                const value = e.currentTarget.value;
                handleUpdateItemInt({
                  value,
                  material_id: item.material_id!,
                  propName: "expected_amount",
                });
              }}
              errors={validationErrors}
              className={"min-w-5"}
            />
            <div className={"flex gap-2 items-end justify-stretch"}>
              <Input
                label="Quantidade real"
                name={`real_amount-${item.material_id}`}
                value={(item.taken_amount || 0) - (item.returned_amount || 0)}
                className={"min-w-5 bg-blue-50!"}
              />
              <div className={"ml-1"}>
                <Button
                  text="X"
                  className={"bg-red-600 py-1 text-white"}
                  onClick={() => {
                    if (item.id) {
                      deleteItem((prev) => [...prev, item.id!]);
                    }
                    handleDeleteItem({
                      matId: item.material_id!,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
