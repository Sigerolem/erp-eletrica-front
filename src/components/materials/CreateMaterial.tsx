import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { fetchWithToken } from "/src/utils/fetchWithToken";
import { MaterialDataForm } from "./MaterialDataForm";
import type { MaterialsType } from "./Materials";
import { Button } from "@elements/Button";

export function CreateMaterial() {
  async function onFormSubmit(materialData: Partial<MaterialsType>) {
    const { data, code } = await fetchWithToken<{ material: MaterialsType }>({
      path: "/materials/create",
      method: "POST",
      body: JSON.stringify(materialData),
    });

    if (code == 201) {
      const material = data.material;
      window.location.reload(); //funciona?
      return null;
    }

    if (code == 409) {
      let erro = {} as { [key: string]: string };
      if (data.message.includes("name")) {
        erro = { ...erro, name: "Esse material já foi previamente cadastrado" };
      }
      if (data.message.includes("barcode")) {
        erro = { ...erro, barcode: "Esse codigo de barras ja está cadastrado" };
      }
      return erro;
    }

    window.alert("Erro ao salvar o material");
    console.error(code, data);
    return { erro: "Algum problema ocorreu" };
  }

  return (
    <div className={""}>
      <MaterialDataForm doOnSubmit={onFormSubmit}>
        <Button text="Salvar material" type={"submit"} />
      </MaterialDataForm>
    </div>
  );
}
