import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Table, Td, THead, Tr } from "src/elements/Table";
import { CreateSupplierModal } from "./CreateSupplierModal";

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

  const SUPPLIER_URL = import.meta.env.DEV
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
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={handleNewSupplier}
          >
            Novo fornecedor
          </button>
        </header>
        <Table>
          <THead
            collumns={[
              ["Nome", "CNPJ"],
              ["Email"],
              ["Telefone", "Celular"],
              ["Materiais", "atualmente"],
            ]}
          />
          <tbody>
            {suppliers.map((supplier) => (
              <Tr key={supplier.id}>
                <Td link={`${SUPPLIER_URL}${supplier.id}/`}>
                  <p>{supplier.name}</p>
                  <p className={"text-green-700"}>{supplier.cnpj ?? ""}</p>
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
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
