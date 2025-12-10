import { useEffect, useState } from "preact/hooks";
import type { MaterialsType } from "./Materials";
import { Input } from "src/elements/Input";
import { Button } from "src/elements/Button";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { validateStringFieldOnBlur } from "src/utils/inputValidation";

export function SelectMaterialModal({
  materials,
  selectMaterial,
  closeModal,
  cleanError,
}: {
  materials: MaterialsType[];
  selectMaterial: (material: MaterialsType) => void;
  closeModal: () => void;
  cleanError: () => void;
}) {
  const [search, setSearch] = useState("");
  const [validationErrors, setValidationErros] = useState<{
    [key: string]: string;
  }>({});
  const [materialsFound, setMaterialsFound] = useState<MaterialsType[]>([]);
  const [nothingWasFound, setNothingWasFound] = useState(false);

  useEffect(() => {
    setMaterialsFound(materials);
  }, [materials]);

  function handleMaterialSelect(material: MaterialsType) {
    selectMaterial(material);
    cleanError();
    closeModal();
  }

  async function handleSearchMaterial(value?: string) {
    const searchString = encodeURIComponent(value ? value : search);
    const { code, data } = await fetchWithToken<{ materials: MaterialsType[] }>(
      {
        path:
          search == ""
            ? "/materials"
            : `/materials?search=${searchString}&page=1`,
      }
    );
    if (code == 200) {
      setMaterialsFound(data.materials);
      setNothingWasFound(data.materials.length == 0);
    }
  }
  return (
    <section className={"absolute top-0 left-0 w-full h-full"}>
      <div
        className={
          "fixed top-0 left-0 w-full h-full p-32 bg-[#000000AA] z-20 overflow-y-scroll"
        }
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
            Selecione um material
          </strong>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="search"
              placeholder={"Nome do material"}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, setSearch, setValidationErros, {
                  min: 2,
                });
              }}
              errors={validationErrors}
              className={"min-h-10 text-lg"}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  const button = document.querySelector<HTMLButtonElement>(
                    "[name='searchButton'"
                  );
                  if (button) {
                    e.currentTarget.blur();
                    setTimeout(() => {
                      button.click();
                      // handleSearchMaterial();
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
          </div>
          <div className={"flex flex-col gap-2 w-full md:grid md:grid-cols-2"}>
            {materialsFound.map((material) => (
              <Button
                key={material.id}
                text={material.name}
                onClick={() => {
                  handleMaterialSelect(material);
                }}
                className={
                  "bg-blue-50 border border-gray-400 flex-1 flex justify-baseline shadow-sm!"
                }
              />
            ))}
          </div>
          {nothingWasFound && (
            <span>Nenhum material encontrado com essa busca!</span>
          )}
        </div>
      </div>
    </section>
  );
}
