import type { SuppliersType } from "@comp/suppliers/Suppliers";
import { Button } from "@elements/Button";
import { BrlStringFromCents } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";
import barcodeIcon from "src/assets/white-barcode-icon.png";
import { Input } from "src/elements/Input";
import { hasPermission } from "src/utils/permissionLogic";
import { SelectSupplierModal } from "../suppliers/SelectSupplierModal";
import { Table, Td, THead, Tr } from "/src/elements/Table";
import { fetchWithToken } from "/src/utils/fetchWithToken";
import { ScanMaterialModal } from "./ScanMaterialModal";

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
  purchase_amount: number;
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
  const [suppliers, setSuppliers] = useState<SuppliersType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [userCanEditMaterial, setUserCanEditMaterial] =
    useState<boolean>(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] =
    useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState({
    name: "",
    id: "",
  });
  const [userCantSeeSuppliers, setUserCantSeeSuppliers] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState({
    amountFound: 0,
    amountShowing: 0,
    limit: 0,
  });
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

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
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "supplier", "R")
    ) {
      setUserCantSeeSuppliers(true);
      return;
    }

    fetchWithToken<{ suppliers: SuppliersType[] }>({
      path: "/suppliers",
    }).then(({ code, data }) => {
      if (code == 200) {
        setSuppliers(data.suppliers);
        const pageQuery = window.location.search;
        if (pageQuery.includes("supplier")) {
          const supId = pageQuery.split("supplier=")[1];
          const sup = data.suppliers.find((s) => s.id == supId);
          if (sup) {
            setSelectedSupplier({ name: sup.name, id: sup.id });
          }
        }
      } else if (code == 403) {
        window.alert(
          "Não foi permitido acesso à lista de fornecedores para filtro.",
        );
      } else {
        window.alert("Erro ao buscar a lista de fornecedores");
        console.error(data);
      }
    });
  }, []);

  useEffect(() => {
    let path = "/materials";
    const pageQuery = window.location.search;

    if (selectedSupplier.id != "" || pageQuery.includes("supplier")) {
      path += `?supplier_id=${selectedSupplier.id || pageQuery.split("supplier=")[1]}`;
      if (search != "") {
        path += `&search=${search}`;
      }
    } else if (search != "") {
      path += `?search=${search}`;
    }
    if (lastQuery == path) {
      return;
    }
    setLastQuery(path);

    fetchWithToken<{
      materials: MaterialsType[];
      limit: number;
      total: number;
    }>({
      path,
    }).then(({ code, data }) => {
      setIsFetching(false);
      if (code == 200) {
        setMaterials(data.materials);
        setSearchInfo({
          amountFound: data.total,
          amountShowing: data.materials.length,
          limit: data.limit,
        });
      } else if (code == 403) {
        window.location.href = "/";
      } else {
        window.alert("Erro ao buscar a lista de materiais");
        console.error(data);
      }
    });
  }, [search, selectedSupplier]);

  // useEffect(() => {
  //   let path = "/materials";
  //   if (selectedSupplier.id != "") {
  //     path += `?supplier_id=${selectedSupplier.id}`;
  //     if (search != "") {
  //       path += `&search=${search}`;
  //     }
  //   } else if (search != "") {
  //     path += `?search=${search}`;
  //   } else {
  //     path += "";
  //   }
  //   fetchWithToken<{
  //     materials: MaterialsType[];
  //     limit: number;
  //     total: number;
  //   }>({
  //     path,
  //   }).then(({ code, data }) => {
  //     setIsFetching(false);
  //     if (code == 200) {
  //       setMaterials(data.materials);
  //       setSearchInfo({
  //         amountFound: data.total,
  //         amountShowing: data.materials.length,
  //         limit: data.limit,
  //       });
  //     } else if (code == 403) {
  //       window.location.href = "/";
  //     } else {
  //       window.alert("Erro ao buscar a lista de materiais");
  //       console.error(data);
  //     }
  //   });
  // }, [selectedSupplier]);

  const xSize = window.innerWidth;

  return (
    <>
      <div className={"pb-20 h-full"}>
        {isBarcodeModalOpen && (
          <ScanMaterialModal
            closeModal={() => {
              setIsBarcodeModalOpen(false);
            }}
          />
        )}
        <header className={"flex justify-between items-end mb-2 not-sm:gap-2"}>
          <div className={"flex gap-2 justify-end items-end"}>
            <h3 className={"text-lg font-semibold text-left -mb-1"}>
              Lista de materiais
            </h3>
          </div>
          <button
            type={"button"}
            className={
              "bg-blue-700 p-1 rounded-lg flex items-center sm:gap-2 not-sm:gap-1 not-sm:flex-col"
            }
            onClick={() => {
              setIsBarcodeModalOpen(true);
            }}
          >
            <span
              className={
                "text-white font-semibold p-0.5 not-sm:text-sm not-sm:-mb-2"
              }
            >
              Buscar
            </span>
            <img
              src={barcodeIcon.src}
              className={"w-8"}
              alt="Ler código de barras"
            />
          </button>
          {userCanEditMaterial && (
            <a href="/materiais/novo">
              <Button
                text="Cadastrar novo"
                className={
                  "bg-blue-700 text-white text-sm not-sm:leading-[1.3]"
                }
              />
            </a>
          )}
        </header>
        <div className={"mt-4 mb-4 flex gap-2 flex-col justify-stretch"}>
          <div className="flex gap-2 items-end">
            <Input
              name="search"
              placeholder={"Pesquise aqui o nome do material"}
              value={search}
              onBlur={(e) => {
                setSearch(e.currentTarget.value);
              }}
            />
            {search != "" && (
              <Button
                text="Limpar"
                className={"bg-slate-600 text-white text-sm"}
                onClick={() => {
                  setSearch("");
                }}
              />
            )}
          </div>
          <div className="flex gap-2 items-end">
            <Input
              name="supplier"
              placeholder={"Todos fornecedores"}
              className={"cursor-pointer"}
              value={selectedSupplier.name}
              onClick={() => {
                setIsSupplierModalOpen(true);
              }}
            />
            {selectedSupplier.name != "" && (
              <Button
                text="Todos fornecedores"
                className={"bg-slate-600 text-white text-sm"}
                onClick={() => {
                  setSelectedSupplier({ name: "", id: "" });
                  const url = new URL(window.location.href);
                  url.searchParams.delete("supplier");
                  window.history.pushState({}, "", url);
                }}
              />
            )}
          </div>
          {isSupplierModalOpen && (
            <SelectSupplierModal
              closeModal={() => {
                setIsSupplierModalOpen(false);
              }}
              selectSupplier={(supplier) => {
                setSelectedSupplier({ name: supplier.name, id: supplier.id });
                setIsSupplierModalOpen(false);
                const url = new URL(window.location.href);
                url.searchParams.set("supplier", String(supplier.id));
                window.history.pushState({}, "", url);
              }}
              suppliers={suppliers}
            />
          )}
        </div>
        {searchInfo.amountFound > searchInfo.limit ? (
          <span className={"text-sm -mt-2 block font-semibold"}>
            Exibindo {searchInfo.amountShowing} de {searchInfo.amountFound}{" "}
            materiais encontrados
          </span>
        ) : (
          <span className={"text-sm -mt-2 block font-semibold"}>
            Exibindo os {searchInfo.amountShowing} materiais encontrados
          </span>
        )}
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
          <tbody className={"overflow-scroll"}>
            {materials.map((material) =>
              xSize < 700 ? (
                <Tr key={material.id}>
                  <Td link={`${MATERIAL_URL}${material.id}/`}>
                    <p className={""}>{material.name} </p>
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
              ),
            )}
          </tbody>
        </Table>
        {isFetching && (
          <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
            Carregando...
          </span>
        )}
        {!isFetching && materials.length == 0 && (
          <span className={"text-xl block mt-8 font-semibold"}>
            Nada encontrado para exibir aqui. Tente recarregar a página ou fazer
            um novo cadastro.
          </span>
        )}
      </div>
    </>
  );
}
