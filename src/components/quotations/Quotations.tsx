import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";

export type QuotationItemTypeType =
  | "inventory_material"
  | "occasional_material";

export type QuotationItemsType = {
  id: string;
  type: string;
  name: string;
  unit: string;
  expected_amount: number;
  awaiting_amount: number;
  taken_amount: number;
  returned_amount: number;
  unit_cost: number;
  unit_profit: number;
  unit_value: number;
  is_private: boolean;
  material_id: string | null;
  quotation_id: string;
};

export type QuotationsStatusType = "draft" | "cancelled";

export type QuotationsType = {
  id: string;
  status: QuotationsStatusType;
  description: string;
  tool_list: string;
  private_comments: string;
  public_comments: string;
  purchase_order: string;
  material_cost: number;
  material_value: number;
  service_cost: number;
  service_value: number;
  direct_cost: number;
  direct_value: number;
  customer_id: string;
  items: QuotationItemsType[];
};

export function Quotations() {
  const [quotations, setQuotations] = useState<QuotationsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const QUOTATION_URL =
    window.location.hostname == "localhost"
      ? "/orcamentos/id#"
      : "/orcamentos/id/#";

  function handleNewCustomer() {
    setIsModalOpen(true);
  }

  useEffect(() => {
    fetchWithToken<{ quotations: QuotationsType[] }>({
      path: "/quotations",
    }).then((result) => {
      if (result.code == 200 || result.code == 201) {
        setQuotations(result.data.quotations);
      } else {
        window.alert("Erro ao buscar orçamentos.");
        console.error(result.data, result.code);
      }
    });
  }, []);

  return (
    <main>
      {/* {isModalOpen ? (
      //   <CreateCustomerModal
      //     closeModal={() => {
      //       setIsModalOpen(false);
      //     }}
      //     setCustomers={setCustomers}
      //   />
      // ) : null} */}
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de orçamentos</h3>
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={handleNewCustomer}
          >
            Novo orçamento
          </button>
        </header>
        <Table>
          <THead collumns={[["Nome", "CNPJ"], ["Celular"]]} />
          <tbody>
            {quotations.map((quotation) => (
              <Tr key={quotation.id}>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{quotation.id}</p>
                  <p className={"text-green-700"}>{quotation.status ?? ""}</p>
                </Td>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{quotation.description}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
