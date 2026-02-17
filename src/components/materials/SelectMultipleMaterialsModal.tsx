import { useEffect, useState } from "preact/hooks";
import type { MaterialsType } from "./Materials";
import { Input } from "src/elements/Input";
import { Button } from "src/elements/Button";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { validateStringFieldOnBlur } from "src/utils/inputValidation";
import { SelectSupplierModal } from "../suppliers/SelectSupplierModal";
import type { SuppliersType } from "../suppliers/Suppliers";

export function SelectMultipleMaterialsModal({
  materials,
  selectMaterial,
  closeModal,
  cleanError,
  isHiddden = false,
  selectedMaterialIds = [],
}: {
  materials: MaterialsType[];
  selectMaterial: (material: MaterialsType) => void;
  closeModal: () => void;
  cleanError: () => void;
  isHiddden?: boolean;
  selectedMaterialIds?: string[];
}) {
  const [search, setSearch] = useState("");
  const [validationErrors, setValidationErros] = useState<{
    [key: string]: string;
  }>({});
  const [materialsFound, setMaterialsFound] = useState<MaterialsType[]>([]);
  const [nothingWasFound, setNothingWasFound] = useState(false);
  const [suppliers, setSuppliers] = useState<SuppliersType[]>([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState({
    name: "",
    id: "",
  });

  useEffect(() => {
    fetchWithToken<{ suppliers: SuppliersType[] }>({
      path: "/suppliers",
    }).then(({ code, data }) => {
      if (code == 200) {
        setSuppliers(data.suppliers);
      }
    });
  }, []);

  useEffect(() => {
    setMaterialsFound(materials);
  }, [materials]);

  function handleMaterialSelect(material: MaterialsType) {
    selectMaterial(material);
    cleanError();
  }

  async function handleSearchMaterial(value?: string) {
    const searchString = encodeURIComponent(value ? value : search);
    let path = "/materials";
    const queryParams = [];

    if (searchString != "") {
      queryParams.push(`search=${searchString}`);
    }

    if (selectedSupplier.id != "") {
      queryParams.push(`supplier_id=${selectedSupplier.id}`);
    }

    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}&page=1`;
    }

    const { code, data } = await fetchWithToken<{ materials: MaterialsType[] }>(
      {
        path,
      },
    );
    if (code == 200) {
      setMaterialsFound(data.materials);
      setNothingWasFound(data.materials.length == 0);
    }
  }

  useEffect(() => {
    handleSearchMaterial();
  }, [selectedSupplier]);

  const xSize = window.innerWidth;
  return (
    <section
      hidden={isHiddden}
      className={"absolute top-0 left-0 w-full h-full"}
    >
      <div
        className={`fixed top-0 left-0 w-full h-full ${
          xSize < 700 ? "p-8" : "p-32"
        } bg-[#000000AA] z-20 overflow-y-scroll`}
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
          <div className={"flex justify-between w-full items-center mb-2"}>
            <strong className={"text-lg block"}>Selecione os materiais</strong>
            <Button
              text="Concluir"
              onClick={closeModal}
              className={"bg-slate-600 text-white px-4"}
            />
          </div>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="search"
              placeholder={"Nome do material"}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, setSearch, setValidationErros, {
                  min: 2,
                });
              }}
              value={search}
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
                handleSearchMaterial();
              }}
              text="Buscar"
            />
            {search != "" && (
              <Button
                text="Limpar"
                onClick={() => {
                  setSearch("");
                  handleSearchMaterial("");
                }}
                className={"bg-gray-600 text-white"}
              />
            )}
          </div>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="supplier"
              placeholder={"Todos fornecedores"}
              value={selectedSupplier.name}
              onClick={() => setIsSupplierModalOpen(true)}
              className={"cursor-pointer"}
              readOnly
            />
            {selectedSupplier.id != "" && (
              <Button
                text="Limpar"
                onClick={() => {
                  setSelectedSupplier({ name: "", id: "" });
                }}
                className={"bg-gray-500 text-white"}
              />
            )}
          </div>
          {isSupplierModalOpen && (
            <SelectSupplierModal
              closeModal={() => {
                setIsSupplierModalOpen(false);
              }}
              selectSupplier={(sup) => {
                setSelectedSupplier({ name: sup.name, id: sup.id });
              }}
              suppliers={suppliers}
            />
          )}
          <div className={"flex flex-col gap-2 w-full md:grid md:grid-cols-2"}>
            {materialsFound.map((material) => {
              const isSelected = selectedMaterialIds.includes(material.id);
              return (
                <Button
                  key={material.id}
                  text={material.name}
                  onClick={() => {
                    handleMaterialSelect(material);
                  }}
                  className={`${
                    isSelected ? "bg-blue-200 shadow-inner!" : "bg-blue-50"
                  } border border-gray-400 flex-1 flex justify-baseline shadow-sm!`}
                />
              );
            })}
          </div>
          {nothingWasFound && (
            <span>Nenhum material encontrado com essa busca!</span>
          )}
          <div className={"flex w-full justify-end mt-4"}>
            <Button
              text="Concluir"
              onClick={closeModal}
              className={"bg-slate-700 text-white px-8"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
