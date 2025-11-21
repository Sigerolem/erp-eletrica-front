import type { CustomersType } from "@comp/customers/Customers";
import type { MaterialsType } from "@comp/materials/Materials";
import { Button } from "@elements/Button";
import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { formatQuotationStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";

export type QuotationItemTypeType =
  | "inventory_material"
  | "occasional_material"
  | "service"
  | "expense";

export type QuotationItemsType = {
  id: string;
  type: QuotationItemTypeType;
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
  material: MaterialsType | null;
  quotation_id: string;
  created_at?: string;
};

export type QuotationsStatusType =
  | "draft"
  | "q_awaiting"
  | "q_approved"
  | "os_awaiting"
  | "os_ongoing"
  | "os_done_mo"
  | "os_done_mat"
  | "awaiting_closure"
  | "awaiting_delivery"
  | "delivered"
  | "awaiting_payment"
  | "finished"
  | "denied"
  | "cancelled";

export type QuotationsType = {
  id: string;
  status: QuotationsStatusType;
  tool_list: string;
  slug: string;
  reference: string;
  description: string;
  discount: number;
  expected_duration: number;
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
  customer: CustomersType;
  items: Partial<QuotationItemsType>[];
};

export function Quotations() {
  const [quotations, setQuotations] = useState<QuotationsType[]>([]);

  const QUOTATION_URL =
    window.location.hostname == "localhost"
      ? "/orcamentos/id#"
      : "/orcamentos/id/#";

  function handleNewCustomer() {
    window.location.href = "/orcamentos/novo";
  }

  useEffect(() => {
    fetchWithToken<{ quotations: QuotationsType[] }>({
      path: "/quotations/quotes",
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
      <div>
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>
            Lista de orçamentos abertos
          </h3>
          <Button text="Novo orçamento" onClick={handleNewCustomer} />
        </header>
        <Table>
          <THead collumns={[["Referência", "Cliente"], ["Situação"]]} />
          <tbody>
            {quotations.map((quotation) => (
              <Tr key={quotation.id}>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{quotation.reference}</p>
                  <p className={"text-green-700"}>{quotation.customer.name}</p>
                </Td>
                <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                  <p>{formatQuotationStatusEnum(quotation.status)}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
