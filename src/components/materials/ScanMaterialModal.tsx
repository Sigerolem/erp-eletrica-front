import { useEffect, useState } from "preact/hooks";
import type { MaterialsType } from "./Materials";
import { Input } from "src/elements/Input";
import { Button } from "src/elements/Button";
import { fetchWithToken } from "src/utils/fetchWithToken";

export function ScanMaterialModal({ closeModal }: { closeModal: () => void }) {
  const [search, setSearch] = useState("");
  const [materialFound, setMaterialFound] = useState<MaterialsType | null>(
    null,
  );
  const [nothingWasFound, setNothingWasFound] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleScanMaterial(input?: string) {
    if (input == "") {
      window.alert("Forneça um código de barra");
      return;
    }
    let path = `/materials/scan/${input}`;

    const { code, data } = await fetchWithToken<{
      material: MaterialsType | null;
    }>({
      path,
    });
    if (code == 200) {
      setMaterialFound(data.material);
      setNothingWasFound(false);
    } else if (code == 404) {
      setNothingWasFound(true);
      setMaterialFound(null);
    }
  }

  const xSize = window.innerWidth;

  return (
    <section className={"absolute top-0 left-0 w-full h-full"}>
      <div
        className={`fixed top-0 left-0 w-full h-full ${
          xSize < 700 ? "p-6" : "p-32"
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
          <strong className={"sm:pb-2 text-lg block not-sm:text-sm"}>
            Forneça um código de barra
          </strong>
          <div className={"flex gap-2 w-full items-end"}>
            <Input
              name="search"
              placeholder={"Código de barra"}
              value={search}
              className={"sm:min-h-10 text-lg"}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  setSearch(e.currentTarget.value);
                  handleScanMaterial(e.currentTarget.value);
                  setTimeout(() => {
                    const input = document.querySelector(
                      'input[name="search"]',
                    ) as HTMLInputElement;
                    input.focus();
                    input.select();
                  }, 100);
                }
              }}
            />
            {search != "" && (
              <Button
                text="Limpar"
                onClick={() => {
                  setSearch("");
                  setMaterialFound(null);
                  setTimeout(() => {
                    const input = document.querySelector(
                      'input[name="search"]',
                    ) as HTMLInputElement;
                    input.focus();
                  }, 100);
                }}
                className={"bg-gray-600 text-white"}
              />
            )}
          </div>
          <div className={"flex flex-col gap-2 w-full md:grid md:grid-cols-2"}>
            {materialFound && (
              <a
                href={`/materials/${materialFound.id}`}
                className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-blue-100 transition-all col-span-full"
              >
                <div className="flex flex-col">
                  <span className="text-lg font-bold not-sm:leading-6">
                    {materialFound.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {materialFound.supplier?.name ?? "Sem Fornecedor"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Input
                    name="quantity"
                    disabled={true}
                    label="Quantidade atual"
                    value={`${materialFound.current_amount} ${materialFound.unit}`}
                    className={`bg-blue-50! font-semibold ${materialFound.current_amount < materialFound.min_amount ? "text-red-600" : ""}`}
                  />
                  <Input
                    name="minimum"
                    disabled={true}
                    label="Quantidade mínima"
                    value={`${materialFound.min_amount} ${materialFound.unit}`}
                    className={"bg-blue-50!"}
                  />
                  <Input
                    name="ideal"
                    disabled={true}
                    label="Quantidade ideal"
                    value={`${materialFound.ideal_amount} ${materialFound.unit}`}
                    className={"bg-blue-50!"}
                  />
                  <Input
                    name="barcode"
                    disabled={true}
                    label="Código de barra"
                    value={`${materialFound.barcode}`}
                    className={"bg-blue-50!"}
                  />
                  <Input
                    name="pkg_barcode"
                    disabled={true}
                    label="Código da caixa"
                    value={`${materialFound.pkg_barcode}`}
                    className={"bg-blue-50!"}
                  />
                </div>
              </a>
            )}
          </div>
          {nothingWasFound && (
            <span>Nenhum material encontrado com essa busca!</span>
          )}
        </div>
      </div>
    </section>
  );
}
