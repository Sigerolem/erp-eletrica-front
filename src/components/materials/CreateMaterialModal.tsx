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

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
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

    // const { data, code } = await fetchWithToken<{ material: MaterialsType }>({
    //   path: "/materials/create",
    //   method: "POST",
    //   body: JSON.stringify({
    //     name,
    //     barcode: barcode.length == 0 ? undefined : barcode,
    //     supplier_id: supplierSelected?.id,
    //     min_amount: minAmount.length == 0 ? undefined : parseInt(minAmount),
    //     ideal_amount:
    //       idealAmount.length == 0 ? undefined : parseInt(idealAmount),
    //     pkg_size: parseInt(pkgSize),
    //     profit: parseFloat(profit.replace(",", ".")),
    //     avg_cost: parseFloat(cost.replaceAll(".", "").replace(",", ".")) * 100,
    //     value: parseFloat(value.replaceAll(".", "").replace(",", ".")) * 100,
    //   }),
    // });
    // if (code == 201) {
    //   const material = data.material;
    //   if (supplierSelected) {
    //     material.supplier = {
    //       name: supplierSelected.name,
    //       id: supplierSelected.id,
    //     };
    //     material.supplier_id = supplierSelected.id;
    //   }
    //   setMaterials((prev) => [material, ...prev]);
    //   form.reset();
    //   closeModal();
    // } else {
    //   console.error(code, data);
    // }
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
            // isSupModalOpen={isSupModalOpen}
            setIsSupModalOpen={setIsSupModalOpen}
          />
        </div>
      </div>
    </section>
  );
}
