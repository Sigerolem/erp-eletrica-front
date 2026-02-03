import { Button } from "@elements/Button";
import { useEffect } from "preact/hooks";
import { MaterialDataForm } from "./MaterialDataForm";
import type { MaterialsType } from "./Materials";
import { fetchWithToken } from "/src/utils/fetchWithToken";
import { hasPermission } from "src/utils/permissionLogic";

export function CreateMaterial() {
  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");

    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "material", "W")
    ) {
      window.location.href = "/materiais";
    }
  }, []);

  async function onFormSubmit(materialData: Partial<MaterialsType>) {
    const { data, code } = await fetchWithToken<{ material: MaterialsType }>({
      path: "/materials/create",
      method: "POST",
      body: JSON.stringify(materialData),
    });

    if (code == 201) {
      const material = data.material;
      window.alert(`${material.name} foi cadastrado com sucesso!`);
      window.location.reload();
      return null;
    }
    if (code == 409) {
      let erro = {} as { [key: string]: string };
      console.log(typeof data.error);
      if (typeof data.error == "string") {
        if (data.error.includes("name")) {
          erro = {
            ...erro,
            name: "Esse material já foi previamente cadastrado",
          };
        }
        if (data.error.includes("pkg_barcode")) {
          erro = {
            ...erro,
            pkg_barcode: "Esse codigo de barras ja está cadastrado",
          };
        }
        if (data.error.includes("entity.barcode")) {
          erro = {
            ...erro,
            barcode: "Esse codigo de barras ja está cadastrado",
          };
        }
        return erro;
      }
    }

    window.alert("Erro ao salvar o material");
    console.error(code, data);
    return { erro: "Algum problema ocorreu" };
  }

  useEffect(() => {
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>("input");
      if (input) {
        input.focus();
      }
    }, 100);
  }, []);

  return (
    <div className={""}>
      <MaterialDataForm doOnSubmit={onFormSubmit}>
        <Button text="Salvar material" type={"submit"} />
      </MaterialDataForm>
    </div>
  );
}
