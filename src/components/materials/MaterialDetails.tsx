import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { MaterialDataForm } from "./MaterialDataForm";
import type { MaterialsType } from "./Materials";
import { Button } from "@elements/Button";
import { hasPermission } from "src/utils/permissionLogic";

export function MaterialDetails() {
  const [material, setMaterial] = useState<MaterialsType | null>(null);
  const [userCanEditMaterial, setUserCanEditMaterial] =
    useState<boolean>(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");

    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "material", "R")
    ) {
      window.location.href = "/";
    }

    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "material", "W")
    ) {
      setUserCanEditMaterial(true);
    }

    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");

    fetchWithToken<{ material: MaterialsType }>({
      path: `/materials/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setMaterial(result.data.material);
      } else if (result.code == 403) {
        window.location.href = "/";
      } else if (result.code == 404) {
        window.alert("Material não encontrado");
        window.location.href = "/materiais";
      } else {
        window.alert("Erro ao buscar o material");
        console.error(result);
      }
    });
  }, []);

  async function handleDataSubmition(materialData: Partial<MaterialsType>) {
    const { code, data } = await fetchWithToken<{ material: MaterialsType }>({
      path: `/materials/${material?.id}`,
      method: "PUT",
      body: JSON.stringify(materialData),
    });

    if (code == 200 || code == 201) {
      setMaterial(data.material);
      window.alert("Altterações salvas");
      return null;
    } else if (code == 409 && typeof data.error == "string") {
      const errors = {} as { [key: string]: string };
      if (data.error.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.error.includes("entity.cnpj")) {
        errors.cnpj = "Esse CNPJ já foi cadastrado";
      } else if (data.error.includes("entity.barcode")) {
        errors.barcode = "Esse codigo já foi cadastrado";
      } else if (data.error.includes("entity.pkg_barcode")) {
        errors.pkg_barcode = "Esse codigo já foi cadastrado";
      }
      return errors;
    }

    if (code == 400 || code == 500) {
      window.alert(
        `Erro ao salvar material. \n ${data.error} \n ${data.message}`,
      );
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
          {userCanEditMaterial ? (
            <Button text="Salvar" type={"submit"} />
          ) : (
            <></>
          )}
        </MaterialDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
