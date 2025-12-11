import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Table, Td, THead, Tr } from "/src/elements/Table";
import { CreateSupplierModal } from "./CreateSupplierModal";
import { Button } from "@elements/Button";

export type SuppliersType = {
  id: string;
  name: string;
  cnpj: string;
  email?: string | null;
  address?: string | null;
  salesperson?: string | null;
  mobile_number?: string | null;
  phone_number?: string | null;
  material_count?: number;
};

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<SuppliersType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleNewSupplier() {
    setIsModalOpen(true);
  }

  const SUPPLIER_URL =
    window.location.hostname == "localhost"
      ? "/fornecedores/id#"
      : "/fornecedores/id/#";

  useEffect(() => {
    fetchWithToken<{ suppliers: SuppliersType[] }>({ path: "/suppliers" }).then(
      (result) => {
        if (result.code == 200 || result.code == 201) {
          setSuppliers(result.data.suppliers);
        } else {
          window.alert("Erro ao buscar fornecedores.");
          console.error(result.data);
        }
      }
    );
  }, []);

  const xSize = window.innerWidth;

  return (
    <main>
      {isModalOpen ? (
        <CreateSupplierModal
          closeModal={() => {
            setIsModalOpen(false);
          }}
          setSupplier={setSuppliers}
        />
      ) : null}
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de fornecedores</h3>
          <Button text="Novo fornecedor" onClick={handleNewSupplier} />
        </header>
        <Table>
          {xSize < 720 ? (
            <THead collumns={[["Nome", "CNPJ"], ["Info"]]} />
          ) : (
            <THead
              collumns={[
                ["Nome", "CNPJ"],
                ["Email"],
                ["Telefone", "Celular"],
                ["Materiais", "atualmente"],
              ]}
            />
          )}
          <tbody>
            {suppliers.map((supplier) =>
              xSize < 720 ? (
                <Tr key={supplier.id}>
                  <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                    <p>{supplier.name}</p>
                    <p className={"font-semibold text-sm"}>
                      {supplier.cnpj ?? ""}
                    </p>
                  </Td>
                  <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                    <p className={""}>
                      <span className={"text-sm font-semibold"}>Email:</span>
                      {` ${supplier.email || ""}`}
                    </p>
                    <p className={""}>
                      <span className={"text-sm font-semibold"}>Telefone:</span>
                      {` ${supplier.phone_number || ""}`}
                    </p>
                    <p className={""}>
                      <span className={"text-sm font-semibold"}>Celular:</span>
                      {` ${supplier.mobile_number || ""}`}
                    </p>
                  </Td>
                </Tr>
              ) : (
                <Tr key={supplier.id}>
                  <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                    <p>{supplier.name}</p>
                    <p className={"font-semibold text-sm"}>
                      {supplier.cnpj ?? ""}
                    </p>
                  </Td>
                  <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                    <p>{supplier.email}</p>
                  </Td>
                  <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                    <p>{supplier.phone_number}</p>
                    <p>{supplier.mobile_number}</p>
                  </Td>
                  <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                    <p>{supplier.material_count || 0}</p>
                  </Td>
                </Tr>
              )
            )}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
