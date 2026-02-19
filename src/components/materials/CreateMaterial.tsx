import { Button } from "@elements/Button";
import { useEffect } from "preact/hooks";
import { MaterialDataForm } from "./MaterialDataForm";
import type { MaterialsType } from "./Materials";
import { fetchWithToken } from "/src/utils/fetchWithToken";
import { hasPermission } from "src/utils/permissionLogic";
import { useState } from "preact/hooks";

export function CreateMaterial() {
  const [isFetching, setIsFetching] = useState(false);

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
    setIsFetching(true);
    const { data, code } = await fetchWithToken<{ material: MaterialsType }>({
      path: "/materials/create",
      method: "POST",
      body: JSON.stringify(materialData),
    });
    setIsFetching(false);

    if (code == 201) {
      const material = data.material;
      window.alert(`${material.name} foi cadastrado com sucesso!`);
      window.location.reload();
      return null;
    }

    if (code == 409) {
      let erro = {} as { [key: string]: string };
      if (typeof data.error == "string") {
        if (data.message.includes("materials_name")) {
          erro = {
            ...erro,
            name: "Esse material já foi cadastrado",
          };
          window.alert(`O material '${materialData.name}' já foi cadastrado.`);
        } else if (data.message.includes("materials_pkg_barcode")) {
          erro = {
            ...erro,
            pkg_barcode: "Esse codigo de barras ja está cadastrado",
          };
          window.alert(
            `O código de barras ${materialData.pkg_barcode} já foi utilizado.`,
          );
        } else if (data.message.includes("materials_barcode")) {
          erro = {
            ...erro,
            barcode: "Esse codigo de barras ja está cadastrado",
          };
          window.alert(
            `O código de barras ${materialData.barcode} já foi utilizado.`,
          );
        } else {
          window.alert(
            "Erro de conflito inesperado. Consulte o desenvolvedor se necessário.",
          );
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
        <Button text="Salvar material" type={"submit"} disabled={isFetching} />
      </MaterialDataForm>
    </div>
  );
}
