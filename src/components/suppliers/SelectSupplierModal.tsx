import { Button } from "@elements/Button";
import type { SuppliersType } from "./Suppliers";
import { useEffect, useState } from "preact/hooks";
import { Input } from "@elements/Input";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import { fetchWithToken } from "@utils/fetchWithToken";

export function SelectSupplierModal({
  suppliers,
  selectSupplier,
  closeModal,
  cleanError,
}: {
  suppliers: SuppliersType[];
  selectSupplier: (supplier: SuppliersType) => void;
  closeModal: () => void;
  cleanError?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [suppliersFound, setSuppliersFound] = useState<SuppliersType[]>([]);
  const [nothingWasFound, setNothingWasFound] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setSuppliersFound(suppliers);
  }, [suppliers]);

  function handleSupplierSelect(supplier: SuppliersType) {
    selectSupplier(supplier);
    cleanError && cleanError();
    closeModal();
  }

  async function handleSearchSupplier() {
    const searchString = encodeURIComponent(search);
    const { code, data } = await fetchWithToken<{
      suppliers: SuppliersType[];
    }>({
      path:
        search == ""
          ? "/suppliers"
          : `/suppliers?search=${searchString}&page=1`,
    });
    if (code == 200) {
      setSuppliersFound(data.suppliers);
      setNothingWasFound(data.suppliers.length == 0);
    }
  }

  const xSize = window.innerWidth;
  return (
    <section className={"absolute top-0 left-0 w-full h-full"}>
      <div
        className={`fixed top-0 left-0 w-full h-full ${
          xSize < 700 ? "p-8" : "p-32"
        } bg-[#000000AA] z-20`}
        onClick={closeModal}
      >
        <div
          className={
            "bg-blue-50 rounded-md p-4 border flex flex-col gap-2 items-baseline"
          }
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <strong className={"pb-2 text-lg block"}>
            Selecione um fornecedor
          </strong>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="search"
              placeholder={"Nome do fornecedor"}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, setSearch, setValidationErrors, {
                  min: 2,
                });
              }}
              errors={validationErrors}
              className={"min-h-10 text-lg"}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  const button = document.querySelector<HTMLButtonElement>(
                    "[name='searchButton']",
                  );
                  if (button) {
                    e.currentTarget.blur();
                    setTimeout(() => {
                      button.click();
                    }, 100);
                  }
                }
              }}
            />
            <Button
              name="searchButton"
              onClick={() => {
                handleSearchSupplier();
              }}
              text="Buscar"
            />
          </div>
          <div className={"flex flex-col gap-2 w-full md:grid md:grid-cols-2"}>
            {suppliersFound.map((supplier) => (
              <Button
                key={supplier.id}
                text={supplier.name}
                onClick={() => {
                  handleSupplierSelect(supplier);
                }}
                className={
                  "bg-blue-50 border border-gray-400 flex-1 text-left shadow-sm! "
                }
              />
            ))}
          </div>
          {nothingWasFound && (
            <span>Nenhum fornecedor encontrado com essa busca!</span>
          )}
        </div>
      </div>
    </section>
  );
}
