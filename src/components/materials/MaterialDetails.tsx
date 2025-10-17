import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import type { MaterialsType } from "./Materials";
import { MaterialDataForm } from "./MaterialDataForm";
import type { SuppliersType } from "@comp/suppliers/Suppliers";

export function MaterialDetails() {
  const [material, setMaterial] = useState<MaterialsType | null>(null);

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "");
    fetchWithToken<{ material: MaterialsType }>({
      path: `/materials/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setMaterial(result.data.material);
      }
    });
  }, []);

  async function handleDataSubmition(materialData: Partial<MaterialsType>) {
    const { code, data } = await fetchWithToken<{ supplier: MaterialsType }>({
      path: `/materials/${material?.id}`,
      method: "PATCH",
      body: JSON.stringify(materialData),
    });

    if (code == 409) {
      const errors = {} as { [key: string]: string };
      if (data.error.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.error.includes("entity.cnpj")) {
        errors.cnpj = "Esse CNPJ já foi cadastrado";
      }
      return errors;
    }

    if (code == 200 || code == 201) {
      window.alert("Altterações salvas");
      return null;
    }

    return { erro: "Alguma coisa" };
  }

  return (
    <main>
      {material ? (
        <MaterialDataForm
          doOnSubmit={handleDataSubmition}
          materialData={material}
        />
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
