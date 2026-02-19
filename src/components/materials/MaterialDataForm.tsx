import { SelectSupplierModal } from "@comp/suppliers/SelectSupplierModal";
import { Input } from "@elements/Input";
import {
  BrlStringFromCents,
  formatFloatWithDecimalDigits,
} from "@utils/formating";
import {
  validateFloatFieldOnBlur,
  validateIntFieldOnBlur,
  validateStringFieldOnBlur,
} from "@utils/inputValidation";
import type { JSX, TargetedSubmitEvent } from "preact";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import type { MaterialsType } from "./Materials";
import { fetchWithToken } from "@utils/fetchWithToken";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { Button } from "@elements/Button";
import { UnitSelector } from "src/elements/UnitSelector";
import { hasPermission } from "src/utils/permissionLogic";

interface MaterialDataFormProps {
  materialData?: MaterialsType;
  doOnSubmit: (
    material: Partial<MaterialsType>,
  ) => Promise<{ [key: string]: string } | null>;
  children: JSX.Element;
}

export function MaterialDataForm({
  materialData,
  doOnSubmit,
  children,
}: MaterialDataFormProps) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [suppliersList, setSuppliersList] = useState<SuppliersType[]>([]);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [pkgBarcode, setPkgBarcode] = useState("");
  const [currentAmount, setCurrentAmount] = useState(0);
  const [trackedAmount, setTrackedAmount] = useState(0);
  const [reservedAmount, setReservedAmount] = useState(0);
  const [minAmount, setMinAmount] = useState(0);
  const [unit, setUnit] = useState("un");
  const [ipi, setIpi] = useState(0);
  const [cleanCost, setCleanCost] = useState(0);
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
  const [barcodeIsValid, setBarcodeIsValid] = useState<boolean | null>(null);
  const [pkgBarcodeIsValid, setPkgBarcodeIsValid] = useState<boolean | null>(
    null,
  );

  const [userCanEditMaterial, setUserCanEditMaterial] = useState(false);
  const [userCanDeleteMaterial, setUserCanDeleteMaterial] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "material", "W")
    ) {
      setUserCanEditMaterial(true);
    }
    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "material", "D")
    ) {
      setUserCanDeleteMaterial(true);
    }
    if (materialData) {
      setName(materialData.name);
      setBarcode(materialData.barcode || "");
      setPkgBarcode(materialData.pkg_barcode || "");
      setCurrentAmount(materialData.current_amount);
      setTrackedAmount(materialData.tracked_amount);
      setReservedAmount(materialData.reserved_amount);
      setMinAmount(materialData.min_amount);
      setIpi(materialData.ipi);
      setUnit(materialData.unit);
      setCleanCost(materialData.clean_cost);
      setIdealAmount(materialData.ideal_amount);
      setPkgSize(materialData.pkg_size);
      setProfit(materialData.profit);
      setCost(materialData.avg_cost);
      setValue(materialData.value);
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
          setSuppliersList(data.suppliers);
        }
      },
    );
  }, []);

  useEffect(() => {
    if (lastField == null) {
      return;
    }

    if (lastField == "profit" || lastField == "cost") {
      const newValue = Math.round((cost * 100_00) / (100_00 - profit));
      setValue(newValue);
    }

    if (lastField == "value") {
      const newProfit = Math.round((1 - cost / value) * 100_00);
      setProfit(newProfit);
    }

    setLastField(null);
  }, [cost, value, profit]);

  async function handleDeleteMaterial(id: string) {
    const result = await fetchWithToken({
      path: `/materials/${id}`,
      method: "DELETE",
    });
    if (result.code == 200) {
      window.location.href = "/materiais";
    }
  }

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (barcodeIsValid === false || pkgBarcodeIsValid === false) {
      window.alert(
        "Não é possivel cadastrar materiais com o código de barras já utilizado!",
      );
      return;
    }
    const submitData = {
      name,
      barcode: barcode || null,
      pkg_barcode: pkgBarcode || null,
      min_amount: minAmount,
      ideal_amount: idealAmount,
      pkg_size: pkgSize,
      profit,
      ipi,
      unit,
      clean_cost: cleanCost,
      avg_cost: cost,
      value,
      supplier_id: supplierSelected?.id || null,
      supplier: supplierSelected || undefined,
      current_amount: currentAmount,
      tracked_amount: trackedAmount,
      reserved_amount: reservedAmount,
    };

    const errors = await doOnSubmit(submitData);
    setValidationErrors((prev) => ({ ...prev, ...errors }));
  }

  async function checkIfBarcodeIsNew(scanCode: string, isPkgField?: boolean) {
    if (scanCode == "") {
      return;
    }

    if (
      materialData !== undefined &&
      (materialData.barcode == scanCode || materialData.pkg_barcode == scanCode)
    ) {
      if (isPkgField) {
        setPkgBarcodeIsValid(null);
      } else {
        setBarcodeIsValid(null);
      }
      return;
    }

    const { code, data } = await fetchWithToken<{
      material: MaterialsType | null;
    }>({ path: `/materials/scan/${scanCode}` });
    if (code == 200) {
      window.alert(
        `Esse código de barras é do material: ${data.material?.name}`,
      );
      if (isPkgField) {
        setPkgBarcodeIsValid(false);
      } else {
        setBarcodeIsValid(false);
      }
    } else if (code == 404) {
      if (isPkgField) {
        setPkgBarcodeIsValid(true);
      } else {
        setBarcodeIsValid(true);
      }
    } else {
      window.alert("Erro ao verificar código de barras.");
    }
  }

  return (
    <form onSubmit={onFormSubmit} className={"flex flex-col gap-3 w-ful"}>
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
        disabled={!userCanEditMaterial}
        className={!userCanEditMaterial ? "bg-blue-50!" : ""}
        errors={validationErrors}
      />
      <div className={"flex gap-4"}>
        <Input
          label="Código de barras"
          name="barcode"
          value={barcode}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setBarcode, setValidationErrors, {
              min: 4,
              max: 100,
            });
            checkIfBarcodeIsNew(e.currentTarget.value);
          }}
          disabled={!userCanEditMaterial}
          className={`${!userCanEditMaterial ? "bg-blue-50!" : ""} 
          ${barcodeIsValid === true ? "bg-green-100! border-green-600" : barcodeIsValid === false ? "bg-red-300! border-red-600" : ""}`}
          errors={validationErrors}
        />
        <Input
          label="Código de barras da caixa"
          name="pkg_barcode"
          value={pkgBarcode}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setPkgBarcode, setValidationErrors, {
              min: 4,
              max: 100,
            });
            checkIfBarcodeIsNew(e.currentTarget.value, true);
          }}
          disabled={!userCanEditMaterial}
          className={`${!userCanEditMaterial ? "bg-blue-50!" : ""} 
          ${pkgBarcodeIsValid === true ? "bg-green-100! border-green-600" : pkgBarcodeIsValid === false ? "bg-red-300! border-red-600" : ""}`}
          errors={validationErrors}
        />
      </div>
      <div className={"flex gap-4"}>
        <UnitSelector
          label="Unidade"
          value={unit}
          doOnSelect={(value) => {
            setUnit(value);
          }}
          disabled={!userCanEditMaterial}
        />
        <Input
          label="Qtd. na embalagem"
          name="pkgSize"
          value={pkgSize}
          onBlur={(e) => {
            validateIntFieldOnBlur(e, setPkgSize, setValidationErrors, {
              min: 1,
            });
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
      </div>
      {materialData != undefined && (
        <div className={"flex gap-4"}>
          <Input
            label="Quantidade reservada"
            name="reservedAmount"
            value={reservedAmount}
            onBlur={(e) => {
              validateIntFieldOnBlur(
                e,
                setReservedAmount,
                setValidationErrors,
                {},
              );
            }}
            disabled={!userCanEditMaterial}
            className={!userCanEditMaterial ? "bg-blue-50!" : ""}
            errors={validationErrors}
          />
          <Input
            label="Quantidade da PJ"
            name="trackedAmount"
            value={trackedAmount}
            onBlur={(e) => {
              validateIntFieldOnBlur(
                e,
                setTrackedAmount,
                setValidationErrors,
                {},
              );
            }}
            disabled={!userCanEditMaterial}
            className={!userCanEditMaterial ? "bg-blue-50!" : ""}
            errors={validationErrors}
          />
        </div>
      )}

      <div className={"grid grid-cols-3 gap-2 not-md:grid-cols-2 "}>
        <Input
          label="Quantidade mínima"
          name="minAmount"
          value={minAmount}
          onBlur={(e) => {
            validateIntFieldOnBlur(e, setMinAmount, setValidationErrors, {});
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
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
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
        <Input
          label="Quantidade atual"
          name="currentAmount"
          value={currentAmount}
          onBlur={(e) => {
            validateIntFieldOnBlur(
              e,
              setCurrentAmount,
              setValidationErrors,
              {},
            );
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
        <Input
          name="supplier"
          label="Fornecedor"
          onFocus={(e) => {
            e.currentTarget.blur();
            setIsSupModalOpen(true);
          }}
          value={supplierSelected === null ? "" : supplierSelected.name}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : "cursor-pointer"}
          errors={validationErrors}
        />
        <Input
          label="IPI"
          name="ipi"
          value={`${(ipi / 100).toFixed(2).replace(".", ",")} %`}
          onBlur={(e) => {
            validateFloatFieldOnBlur(e, setIpi, setValidationErrors, {
              removeFromString: " %",
            });
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
        <Input
          label="Preço s/ IPI"
          name="cleanCost"
          value={BrlStringFromCents(cleanCost)}
          onBlur={(e) => {
            validateFloatFieldOnBlur(e, setCleanCost, setValidationErrors, {
              removeFromString: "R$",
              min: 0,
            });
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
        <Input
          label="Custo"
          name="cost"
          value={BrlStringFromCents(cost)}
          onBlur={(e) => {
            setLastField("cost");
            validateFloatFieldOnBlur(e, setCost, setValidationErrors, {
              removeFromString: "R$",
              min: 0,
            });
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
        <Input
          label="Lucro"
          name="profit"
          value={`${(profit / 100).toFixed(2).replace(".", ",")} %`}
          onBlur={(e) => {
            setLastField("profit");
            validateFloatFieldOnBlur(e, setProfit, setValidationErrors, {
              removeFromString: " %",
            });
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
        <Input
          label="Valor"
          name="value"
          value={BrlStringFromCents(value)}
          onBlur={(e) => {
            setLastField("value");
            validateFloatFieldOnBlur(e, setValue, setValidationErrors, {
              removeFromString: "R$",
              min: 0,
            });
          }}
          disabled={!userCanEditMaterial}
          className={!userCanEditMaterial ? "bg-blue-50!" : ""}
          errors={validationErrors}
        />
      </div>

      <div className={"flex gap-4 mt-4 justify-evenly items-end"}>
        {children}
        {materialData?.is_disabled === false &&
        materialData.reserved_amount == 0 &&
        materialData.current_amount == 0 &&
        userCanDeleteMaterial ? (
          <Button
            text="Excluir material"
            type={"button"}
            className={"bg-red-700 text-white"}
            onClick={() => {
              handleDeleteMaterial(materialData.id);
            }}
          />
        ) : (
          false
        )}
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
