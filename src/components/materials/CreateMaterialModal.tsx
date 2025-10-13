import type { TargetedEvent, TargetedSubmitEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Input } from "src/elements/Input";
import { SelectSupplierModal } from "./SelectSupplierModal";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { validateDecimalInput } from "@utils/validateDecimalInput";

export function CreateMaterialModal({
  closeModal,
  suppliersList,
}: {
  closeModal: () => void;
  suppliersList: { id: string; name: string }[];
}) {
  const [pkgSize, setPkgSize] = useState("1");
  const [profit, setProfit] = useState("0,0 %");
  const [cost, setCost] = useState("0,00");
  const [value, setValue] = useState("0,00");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [supplierSelected, setSupplierSelected] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        if (isSupModalOpen) {
          setIsSupModalOpen(false);
        } else {
          closeModal();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isSupModalOpen]);

  function handleChangeAmount(e: TargetedEvent<HTMLInputElement>) {
    const value = parseInt(e.currentTarget.value);
    const name = e.currentTarget.name;
    if (isNaN(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "Digite um número válido",
      }));
      e.currentTarget.value = "0";
    } else {
      setValidationErrors((prev) => {
        delete prev[name];
        return { ...prev };
      });
      e.currentTarget.value = value.toLocaleString("pt-BR");
    }
  }

  function handleChangePkgSize(e: TargetedEvent<HTMLInputElement>) {
    console.log(e.currentTarget.value);
    const value = Math.round(parseInt(e.currentTarget.value));
    if (isNaN(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        pkgSize: "Digite um valor valido",
      }));
      setPkgSize("1");
    } else {
      setValidationErrors((prev) => {
        delete prev.pkgSize;
        return { ...prev };
      });
      setPkgSize(value.toLocaleString("pt-BR"));
    }
  }

  function handleChangeCost(e: TargetedEvent<HTMLInputElement>) {
    console.log("mudou para ", e.currentTarget.value);
    const stringVal = e.currentTarget.value;
    const result = validateDecimalInput(stringVal);
    if (result.error) {
      setValidationErrors((prev) => ({
        ...prev,
        cost: "Digite um custo válido",
      }));
      setValue("0,00");
      setCost("0,00");
    } else {
      setValidationErrors((prev) => {
        delete prev.cost;
        return { ...prev };
      });
      setCost(result.float00String);
      const profitValue = parseFloat(
        profit.replaceAll(".", "").replace(",", ".")
      );
      const newValue = (result.float00Value * 100) / (100 - profitValue);
      setValue(
        newValue.toLocaleString("pt-BR", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })
      );
    }
  }

  function handleChangeProfit(e: TargetedEvent<HTMLInputElement>) {
    if (e.target instanceof HTMLInputElement) {
      const value = e.target.value;
      const result = validateDecimalInput(value);
      if (result.error !== undefined) {
        const errorMessage = result.error;
        setValidationErrors((prev) => ({ ...prev, profit: errorMessage }));
        setProfit("0,0 %");
        setValue(cost);
      } else {
        setValidationErrors((prev) => {
          delete prev.profit;
          return { ...prev };
        });
        setProfit(`${result.float0String} %`);
        const costFloat = parseFloat(
          cost.replaceAll(".", "").replace(",", ".")
        );
        const newValue = (costFloat * 100) / (100 - result.float0Value);
        setValue(
          newValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }
    }
  }

  function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as {
      name: string;
      barcode: string;
      minAmount: string;
      idealAmount: string;
      pkgSize: string;
      profit: string;
      cost: string;
    };

    const { name, barcode, cost, idealAmount, minAmount, pkgSize, profit } =
      formData;

    const newErrors = validationErrors;

    if (name.length < 4 || name.length > 100) {
      newErrors.name = "O nome do material deve ter entre 3 e 100 letras.";
    } else {
      delete newErrors.name;
    }

    if (barcode.length > 100) {
      newErrors.barcode =
        "O código de barras deve ter menos de 100 caracteres.";
    } else {
      delete newErrors.barcode;
    }

    if (supplierSelected == null) {
      newErrors.supplier = "Selecione um fornecedor";
    } else {
      delete newErrors.supplier;
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...newErrors }));
    } else {
      setValidationErrors({ ...newErrors });
      fetchWithToken({
        path: "/materials/create",
        method: "POST",
        body: JSON.stringify({
          name,
          barcode: barcode.length == 0 ? undefined : barcode,
          supplier_id: supplierSelected?.id,
          min_amount: minAmount.length == 0 ? undefined : parseInt(minAmount),
          ideal_amount:
            idealAmount.length == 0 ? undefined : parseInt(idealAmount),
          pkg_size: parseInt(pkgSize),
          profit: parseFloat(profit.replace(",", ".")),
          avg_cost:
            parseFloat(cost.replaceAll(".", "").replace(",", ".")) * 100,
          value: parseFloat(value.replaceAll(".", "").replace(",", ".")) * 100,
        }),
      })
        .then((response) => {
          if (response.status == 401) {
            localStorage.removeItem("apiToken");
          }
          console.log(response);
        })
        .catch((error) => {
          console.log("deu ruim", error);
        });
    }
  }

  return (
    <section
      className={"absolute top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-10"}
      onClick={() => {
        closeModal();
      }}
    >
      <div
        className={"bg-blue-50 p-8 opacity-100 rounded-md"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={"flex justify-between mb-4"}>
          <h2 className={"text-3xl font-semibold"}>Cadastrar novo material</h2>
          <button
            className={"bg-red-700 p-2 rounded-md font-semibold text-white"}
            onClick={() => {
              closeModal();
            }}
          >
            Cancelar
          </button>
        </header>
        <div>
          <form onSubmit={onFormSubmit} className={"flex flex-col gap-2 w-ful"}>
            <Input
              label="Nome do material"
              name="name"
              onBlur={(e) => {
                if (
                  e.currentTarget.value.length > 3 &&
                  e.currentTarget.value.length <= 100
                ) {
                  setValidationErrors((prev) => {
                    delete prev.name;
                    return { ...prev };
                  });
                }
              }}
              errors={validationErrors}
            />
            <Input
              label="Codigo de barras"
              name="barcode"
              onBlur={(e) => {
                if (e.currentTarget.value.length <= 100) {
                  setValidationErrors((prev) => {
                    delete prev.barcode;
                    return { ...prev };
                  });
                }
              }}
            />
            <div className={"flex gap-4"}>
              <Input
                label="Quantidade mínima"
                name="minAmount"
                onBlur={handleChangeAmount}
                errors={validationErrors}
              />
              <Input
                label="Quantidade ideal"
                name="idealAmount"
                onBlur={handleChangeAmount}
                errors={validationErrors}
              />
            </div>
            <div className={"flex gap-4"}>
              <Input
                label="Tamanho da embalagem"
                name="pkgSize"
                value={pkgSize}
                onBlur={handleChangePkgSize}
                errors={validationErrors}
              />
              <Input
                label="Lucro"
                name="profit"
                value={profit}
                onBlur={handleChangeProfit}
              />
            </div>
            <div className={"flex gap-4"}>
              <Input
                label="Custo [R$]"
                name="cost"
                value={cost}
                onBlur={handleChangeCost}
                errors={validationErrors}
              />
              <Input label="Valor [R$]" name="value" value={value} disabled />
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
          </form>
          {isSupModalOpen ? (
            <SelectSupplierModal
              suppliers={suppliersList}
              closeModal={() => {
                setIsSupModalOpen(false);
              }}
              selectSupplier={({ id, name }: { id: string; name: string }) => {
                setSupplierSelected({ id, name });
                setValidationErrors((prev) => {
                  delete prev.supplier;
                  return { ...prev };
                });
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
