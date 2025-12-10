import { useEffect, useState } from "preact/hooks";
import { CreateMaterialModal } from "@comp/materials/CreateMaterialModal";
import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { fetchWithToken } from "/src/utils/fetchWithToken";
import { Table, Td, THead, Tr } from "/src/elements/Table";
import { BrlStringFromCents } from "@utils/formating";
import { Button } from "@elements/Button";

export type MaterialsType = {
  id: string;
  name: string;
  barcode: string | null;
  pkg_barcode: string | null;
  pkg_size: number;
  min_amount: number;
  ideal_amount: number;
  ipi: number;
  clean_cost: number;
  unit: string;
  reserved_amount: number;
  current_amount: number;
  tracked_amount: number;
  avg_cost: number;
  profit: number;
  value: number;
  is_disabled: boolean;
  supplier?: Pick<SuppliersType, "id" | "name">;
  supplier_id: string | null;
};

const MATERIAL_URL =
  window.location.hostname == "localhost"
    ? "/materiais/id#"
    : "/materiais/id/#";

export function Materials() {
  const [materials, setMaterials] = useState<MaterialsType[]>([]);

  useEffect(() => {
    fetchWithToken<{ materials: MaterialsType[] }>({ path: "/materials" }).then(
      ({ code, data }) => {
        if (code == 200) {
          setMaterials(data.materials);
        } else {
          window.alert("Erro ao buscar a lista de materiais");
          console.error(data);
        }
      }
    );
  }, []);

  const xSize = window.innerWidth;

  return (
    <>
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de materiais</h3>
          <a href="/materiais/novo">
            <Button text="Novo material" />
          </a>
        </header>
        <Table>
          {xSize < 700 ? (
            <THead collumns={[["Nome", "Fornecedor"], ["Estoque"]]} />
          ) : (
            <THead
              collumns={[
                ["Nome", "Fornecedor"],
                ["Estoque"],
                ["Preços", "(custo / venda)"],
              ]}
            />
          )}
          <tbody>
            {materials.map((material) =>
              xSize < 700 ? (
                <Tr key={material.id}>
                  <Td link={`${MATERIAL_URL}${material.id}/`}>
                    <p className={""}>
                      {material.name} iduhasiud daiudhiuadhaduasda audhau{" "}
                    </p>
                    <p className={"text-sm font-semibold"}>
                      {material.supplier?.name ?? "Sem Fornecedor"}
                    </p>
                  </Td>
                  <Td link={`${MATERIAL_URL}${material.id}/`}>
                    <p
                      className={`min-w-32 ${
                        material.current_amount < material.min_amount &&
                        "text-red-600 font-semibold"
                      }`}
                    >
                      <span className={"text-sm font-semibold"}>Atual:</span>
                      {` ${material.current_amount} 
                      ${material.unit}`}
                    </p>
                    <p className={"min-w-32"}>
                      <span className={"text-sm font-semibold"}>Mín:</span>
                      {` ${material.min_amount} 
                      ${material.unit}`}
                    </p>
                    <p className={"min-w-32"}>
                      <span className={"text-sm font-semibold"}>
                        Reservado:
                      </span>
                      {` ${material.reserved_amount} 
                      ${material.unit}`}
                    </p>
                  </Td>
                </Tr>
              ) : (
                <Tr key={material.id}>
                  <Td link={`${MATERIAL_URL}${material.id}/`}>
                    <p className={""}>{material.name}</p>
                    <p className={"text-sm font-semibold"}>
                      {material.supplier?.name ?? ""}
                    </p>
                  </Td>
                  <Td link={`${MATERIAL_URL}${material.id}/`}>
                    <p
                      className={`min-w-32 ${
                        material.current_amount < material.min_amount &&
                        "text-red-600 font-semibold"
                      }`}
                    >
                      <span className={"text-sm font-semibold text-black"}>
                        Atual:
                      </span>
                      {` ${material.current_amount} 
                      ${material.unit}`}
                    </p>
                    <p className={"min-w-32"}>
                      <span className={"text-sm font-semibold"}>Mín.:</span>
                      {` ${material.min_amount} 
                      ${material.unit}`}
                    </p>
                    <p className={"min-w-32"}>
                      <span className={"text-sm font-semibold"}>
                        Reservado:
                      </span>
                      {` ${material.reserved_amount} 
                      ${material.unit}`}
                    </p>
                  </Td>
                  <Td link={`${MATERIAL_URL}${material.id}/`}>
                    <p className={""}>
                      C: {BrlStringFromCents(material.avg_cost)}
                    </p>
                    <p className={""}>
                      V: {BrlStringFromCents(material.value)}
                    </p>
                  </Td>
                </Tr>
              )
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
