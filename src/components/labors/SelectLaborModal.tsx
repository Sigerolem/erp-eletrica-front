import { useEffect, useState } from "preact/hooks";
import type { LaborsType } from "./Labors";
import { Input } from "src/elements/Input";
import { Button } from "src/elements/Button";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { validateStringFieldOnBlur } from "src/utils/inputValidation";

export function SelectLaborModal({
  labors,
  selectLabor,
  closeModal,
  cleanError,
}: {
  labors: LaborsType[];
  selectLabor: (labor: LaborsType) => void;
  closeModal: () => void;
  cleanError: () => void;
}) {
  const [search, setSearch] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [laborsFound, setLaborsFound] = useState<LaborsType[]>([]);
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
    setLaborsFound(labors);
  }, [labors]);

  function handleLaborSelect(labor: LaborsType) {
    selectLabor(labor);
    cleanError();
    closeModal();
  }

  async function handleSearchLabor(value?: string) {
    const searchString = encodeURIComponent(value ? value : search);
    const { code, data } = await fetchWithToken<{ labors: LaborsType[] }>({
      path:
        search == ""
          ? "/labors"
          : `/labors?search=${searchString}&page=1`,
    });
    if (code == 200) {
      setLaborsFound(data.labors);
      setNothingWasFound(data.labors.length == 0);
    }
  }

  const xSize = window.innerWidth;
  return (
    <section className={"absolute top-0 left-0 w-full h-full"}>
      <div
        className={`fixed top-0 left-0 w-full h-full ${xSize < 700 ? "p-8" : "p-32"
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
          <strong className={"pb-2 text-lg block"}>
            Selecione um serviço
          </strong>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="search"
              placeholder={"Nome do serviço"}
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
                    "[name='searchButton']"
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
                handleSearchLabor();
              }}
              text="Buscar"
            />
          </div>
          <div className={"flex flex-col gap-2 w-full md:grid md:grid-cols-2"}>
            {laborsFound.map((labor) => (
              <Button
                key={labor.id}
                text={labor.name}
                onClick={() => {
                  handleLaborSelect(labor);
                }}
                className={
                  "bg-blue-50 border border-gray-400 flex-1 flex justify-baseline shadow-sm!"
                }
              />
            ))}
          </div>
          {nothingWasFound && (
            <span>Nenhum serviço encontrado com essa busca!</span>
          )}
        </div>

      </div>
    </section>
  );
}
