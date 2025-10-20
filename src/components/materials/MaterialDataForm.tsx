import { SelectSupplierModal } from "@comp/suppliers/SelectSupplierModal";
import { Input } from "@elements/Input";
import { formatFloatWithDecimalDigits } from "@utils/formating";
import {
  validateFloatFieldOnBlur,
  validateIntFieldOnBlur,
  validateStringFieldOnBlur,
} from "@utils/inputValidation";
import type { TargetedSubmitEvent } from "preact";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { MaterialsType } from "./Materials";
import { fetchWithToken } from "@utils/fetchWithToken";
import type { SuppliersType } from "@comp/suppliers/Suppliers";

interface MaterialDataFormProps {
  materialData?: MaterialsType;
  doOnSubmit: (
    material: Partial<MaterialsType>
  ) => Promise<{ [key: string]: string } | null>;
}

export function MaterialDataForm({
  materialData,
  doOnSubmit,
}: MaterialDataFormProps) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [suppliersList, setSuppliersList] = useState<
    { id: string; name: string }[]
  >([]);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [currentAmount, setCurrentAmount] = useState(0);
  const [reservedAmount, setReservedAmount] = useState(0);
  const [minAmount, setMinAmount] = useState(0);
  const [idealAmount, setIdealAmount] = useState(0);
  const [pkgSize, setPkgSize] = useState(1);
  const [profit, setProfit] = useState(0);
  const [cost, setCost] = useState(0);
  const [value, setValue] = useState(0);
  const [lastField, setLastField] = useState<string | null>(null);
  const [supplierSelected, setSupplierSelected] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (materialData) {
      setName(materialData.name);
      setBarcode(materialData.barcode || "");
      setCurrentAmount(materialData.current_amount);
      setReservedAmount(materialData.reserved_amount);
      setMinAmount(materialData.min_amount);
      setIdealAmount(materialData.ideal_amount);
      setPkgSize(materialData.pkg_size);
      setProfit(materialData.profit / 100);
      setCost(materialData.avg_cost / 100);
      setValue(materialData.value / 100);
      if (materialData.supplier) {
        setSupplierSelected(materialData.supplier);
      }
    }
  }, [materialData]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key == "Escape") {
        setIsSupModalOpen(false);
      }
    };

    if (isSupModalOpen) {
      document.addEventListener("keydown", handleKeyPress, { capture: true });

      return () => {
        document.removeEventListener("keydown", handleKeyPress, {
          capture: true,
        });
      };
    }
  }, [isSupModalOpen]);

  useEffect(() => {
    fetchWithToken<{ suppliers: SuppliersType[] }>({ path: "/suppliers" }).then(
      ({ code, data }) => {
        if (code === 200) {
          setSuppliersList([
            ...data.suppliers.map((supplier) => ({
              id: supplier.id,
              name: supplier.name,
            })),
          ]);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (lastField == null) {
      return;
    }

    if (lastField == "profit" || lastField == "cost") {
      const newValue = (cost * 100) / (100 - profit);
      setValue(formatFloatWithDecimalDigits(newValue, 2));
    }

    if (lastField == "value") {
      const newProfit = (1 - cost / value) * 100;
      setProfit(formatFloatWithDecimalDigits(newProfit, 1));
    }

    setLastField(null);
  }, [cost, value, profit]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const submitData = {
      name,
      barcode: barcode || null,
      min_amount: minAmount,
      ideal_amount: idealAmount,
      pkg_size: pkgSize,
      profit: profit * 100,
      avg_cost: cost * 100,
      value: value * 100,
      supplier_id: supplierSelected?.id || null,
      supplier: supplierSelected || undefined,
      current_amount: currentAmount || 0,
      reserved_amount: reservedAmount || 0,
    };

    const errors = await doOnSubmit(submitData);
    setValidationErrors((prev) => ({ ...prev, ...errors }));
  }

  return (
    <form onSubmit={onFormSubmit} className={"flex flex-col gap-2 w-ful"}>
      <Input
        label="Nome do material"
        name="name"
        value={name}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setName, setValidationErrors, {
            min: 4,
            max: 100,
            required: true,
          });
        }}
        errors={validationErrors}
      />
      <Input
        label="Código de barras"
        name="barcode"
        value={barcode}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setBarcode, setValidationErrors, {
            min: 4,
            max: 100,
          });
        }}
        errors={validationErrors}
      />
      {materialData != undefined && (
        <div className={"flex gap-4"}>
          <Input
            label="Quantidade atual"
            name="currentAmount"
            value={currentAmount}
            onBlur={(e) => {
              validateIntFieldOnBlur(
                e,
                setCurrentAmount,
                setValidationErrors,
                {}
              );
            }}
            errors={validationErrors}
          />
          <Input
            label="Quantidade reservada"
            name="reservedAmount"
            value={reservedAmount}
            onBlur={(e) => {
              validateIntFieldOnBlur(
                e,
                setReservedAmount,
                setValidationErrors,
                {}
              );
            }}
            errors={validationErrors}
          />
        </div>
      )}
      <div className={"flex gap-4"}>
        <Input
          label="Quantidade mínima"
          name="minAmount"
          value={minAmount}
          onBlur={(e) => {
            validateIntFieldOnBlur(e, setMinAmount, setValidationErrors, {});
          }}
          errors={validationErrors}
        />
        <Input
          label="Quantidade ideal"
          name="idealAmount"
          value={idealAmount}
          onBlur={(e) => {
            validateIntFieldOnBlur(e, setIdealAmount, setValidationErrors, {
              min: minAmount,
            });
          }}
          errors={validationErrors}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Tamanho da embalagem"
          name="pkgSize"
          value={pkgSize}
          onBlur={(e) => {
            validateIntFieldOnBlur(e, setPkgSize, setValidationErrors, {
              min: 1,
            });
          }}
          errors={validationErrors}
        />
        <Input
          label="Lucro"
          name="profit"
          value={`${profit.toLocaleString("pt-Br")} %`}
          onBlur={(e) => {
            setLastField("profit");
            validateFloatFieldOnBlur(e, setProfit, setValidationErrors, {
              decimalDigits: 1,
              removeFromString: " %",
            });
          }}
          errors={validationErrors}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Custo [R$]"
          name="cost"
          value={cost.toLocaleString("pt-Br", {
            currency: "BRL",
            style: "currency",
          })}
          onBlur={(e) => {
            setLastField("cost");
            validateFloatFieldOnBlur(e, setCost, setValidationErrors, {
              decimalDigits: 2,
              removeFromString: "R$",
              min: 0,
            });
          }}
          errors={validationErrors}
        />
        <Input
          label="Valor [R$]"
          name="value"
          value={value.toLocaleString("pt-Br", {
            currency: "BRL",
            style: "currency",
          })}
          onBlur={(e) => {
            setLastField("value");
            validateFloatFieldOnBlur(e, setValue, setValidationErrors, {
              decimalDigits: 2,
              removeFromString: "R$",
              min: 0,
            });
          }}
          errors={validationErrors}
        />
      </div>
      <div className={"flex gap-4 justify-between items-end"}>
        <div>
          <Input
            name="supplier"
            label="Fornecedor"
            onFocus={(e) => {
              e.currentTarget.blur();
              setIsSupModalOpen(true);
            }}
            className={"cursor-pointer"}
            value={supplierSelected === null ? "" : supplierSelected.name}
            errors={validationErrors}
          />
        </div>
        <button
          className={
            "bg-blue-800 p-2 max-w-2xl rounded-md font-semibold text-white"
          }
          type={"submit"}
        >
          Salvar
        </button>
      </div>
      {isSupModalOpen ? (
        <SelectSupplierModal
          suppliers={suppliersList}
          closeModal={() => {
            setIsSupModalOpen(false);
          }}
          selectSupplier={setSupplierSelected}
          cleanError={() => {
            setValidationErrors((prev) => {
              delete prev.supplier;
              return { ...prev };
            });
          }}
        />
      ) : null}
    </form>
  );
}
