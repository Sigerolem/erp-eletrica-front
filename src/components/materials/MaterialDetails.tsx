import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { MaterialDataForm } from "./MaterialDataForm";
import type { MaterialsType } from "./Materials";
import { Button } from "@elements/Button";

export function MaterialDetails() {
  const [material, setMaterial] = useState<MaterialsType | null>(null);

  useEffect(() => {
    const path = new URL(window.location.href);

    const id = path.hash.replace("#", "").replaceAll("/", "");
    // : path.pathname.replace("/materiais/id/", "");

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
      method: "PUT",
      body: JSON.stringify(materialData),
    });

    if (code == 409) {
      const errors = {} as { [key: string]: string };
      if (data.message.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.message.includes("entity.cnpj")) {
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
        >
          <Button text="Salvar" type={"submit"} />
        </MaterialDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
