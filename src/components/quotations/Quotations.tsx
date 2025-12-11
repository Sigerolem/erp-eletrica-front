import type { CustomersType } from "@comp/customers/Customers";
import type { MaterialsType } from "@comp/materials/Materials";
import type {
  TransactionItemsType,
  TransactionsType,
} from "@comp/transactions/Transactions";
import { Button } from "@elements/Button";
import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { formatQuotationStatusEnum } from "@utils/formating";
import { useEffect, useState } from "preact/hooks";
import { fetchPdf } from "src/utils/fetchPdf";

export type QuotationItemTypeType =
  | "occasional_material"
  | "service"
  | "expense";

export type QuotationMaterialsType = {
  id: string;
  name: string;
  expected_amount: number;
  taken_amount: number;
  returned_amount: number;
  unit_cost: number;
  unit_profit: number;
  unit_value: number;
  is_private: boolean;
  material_id: string;
  material: MaterialsType;
  transaction_item_id: string | null;
  transaction_item: TransactionItemsType | null;
  quotation_id: string;
  created_at?: string;
};

export type QuotationItemsType = {
  id: string;
  type: QuotationItemTypeType;
  name: string;
  unit: string;
  expected_amount: number;
  taken_amount: number;
  unit_cost: number;
  unit_profit: number;
  unit_value: number;
  is_private: boolean;
  quotation_id: string;
  created_at?: string;
};

export type QuotationsStatusType =
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
  mat_discount: number;
  ser_discount: number;
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
  materials: Partial<QuotationItemsType>[];
  transaction: Partial<TransactionsType> | null;
};

export function Quotations() {
  const [quotations, setQuotations] = useState<QuotationsType[]>([]);
  const [hasNothingToShow, setHasNothingToShow] = useState(false);

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
        if (result.data.quotations.length == 0) {
          setHasNothingToShow(true);
        } else {
          setQuotations(result.data.quotations);
        }
      } else {
        window.alert("Erro ao buscar orçamentos.");
        console.error(result.data, result.code);
      }
    });
  }, []);

  const xSize = window.innerWidth;
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
          {xSize < 720 ? (
            <THead collumns={[["Referência", "Cliente"], ["Situação"]]} />
          ) : (
            <THead
              collumns={[
                ["Código"],
                ["Referência", "Cliente"],
                ["Situação"],
                [""],
              ]}
            />
          )}
          <tbody>
            {hasNothingToShow && (
              <tr>
                <td colSpan={3} className={"py-2 text-center"}>
                  <span className={"text-center"}>
                    Nada para ser exibido aqui
                  </span>
                </td>
              </tr>
            )}
            {quotations.map((quotation) =>
              xSize < 720 ? (
                <Tr key={quotation.id}>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{quotation.slug}</p>
                    <p>{quotation.reference}</p>
                    <p className={"font-semibold text-sm"}>
                      {quotation.customer.name}
                    </p>
                  </Td>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{formatQuotationStatusEnum(quotation.status)}</p>
                    <Button
                      text="PDF Detalhado"
                      onClick={() =>
                        fetchPdf(`/quotations/print/${quotation.id}`)
                      }
                    />
                    <Button
                      text="PDF"
                      onClick={() =>
                        fetchPdf(
                          `/quotations/print/${quotation.id}?mode=hidden`
                        )
                      }
                      className={"ml-2 bg-blue-700 text-white"}
                    />
                  </Td>
                </Tr>
              ) : (
                <Tr key={quotation.id}>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{quotation.slug}</p>
                  </Td>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{quotation.reference}</p>
                    <p className={"font-semibold text-sm"}>
                      {quotation.customer.name}
                    </p>
                  </Td>
                  <Td link={`${QUOTATION_URL}${quotation.id}/`}>
                    <p>{formatQuotationStatusEnum(quotation.status)}</p>
                  </Td>
                  <Td>
                    <Button
                      text="PDF"
                      onClick={() =>
                        fetchPdf(`/quotations/print/${quotation.id}`)
                      }
                    />
                    <Button
                      text="PDF s/ valores"
                      onClick={() =>
                        fetchPdf(
                          `/quotations/print/${quotation.id}?mode=hidden`
                        )
                      }
                      className={"ml-2 bg-blue-700 text-white"}
                    />
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
