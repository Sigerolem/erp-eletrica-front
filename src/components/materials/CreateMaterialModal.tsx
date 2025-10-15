import { validateDecimalInput } from "@utils/validateDecimalInput";
import type { TargetedEvent, TargetedSubmitEvent } from "preact";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { fetchWithToken } from "src/utils/fetchWithToken";
import { MaterialDataForm } from "./MaterialDataForm";
import type { MaterialsType } from "./Materials";

export function CreateMaterialModal({
  closeModal,
  suppliersList,
  setMaterials,
}: {
  closeModal: () => void;
  suppliersList: { id: string; name: string }[];
  setMaterials: Dispatch<StateUpdater<MaterialsType[]>>;
}) {
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key == "Escape") {
        closeModal();
      }
    };

    if (!isSupModalOpen) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isSupModalOpen]);

  async function onFormSubmit(materialData: Partial<MaterialsType>) {
    const { data, code } = await fetchWithToken<{ material: MaterialsType }>({
      path: "/materials/create",
      method: "POST",
      body: JSON.stringify(materialData),
    });

    if (code == 201) {
      const material = data.material;

      setMaterials((prev) => [material, ...prev]);
      closeModal();
      return null;
    }

    if (code == 409) {
      let erro = {} as { [key: string]: string };
      if (data.error.includes("name")) {
        erro = { ...erro, name: "Esse material já foi previamente cadastrado" };
      }
      if (data.error.includes("barcode")) {
        erro = { ...erro, barcode: "Esse codigo de barras ja está cadastrado" };
      }
      return erro;
    }

    window.alert("Erro ao salvar o material");
    console.error(code, data);
    return { erro: "Algum problema ocorreu" };
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
          <MaterialDataForm
            suppliersList={suppliersList}
            doOnSubmit={onFormSubmit}
            setIsSupModalOpen={setIsSupModalOpen}
          />
        </div>
      </div>
    </section>
  );
}
