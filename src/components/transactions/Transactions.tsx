import type { MaterialsType } from "@comp/materials/Materials";
import type { QuotationsType } from "@comp/quotations/Quotations";
import { Button } from "@elements/Button";
import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";

export type TransactionItemsType = {
  id: string;
  name: string;
  unit: string;
  expected_amount: number;
  taken_amount: number;
  returned_amount: number;
  unit_cost: number;
  unit_profit: number;
  unit_value: number;
  material_id: string | null;
  material: MaterialsType | null;
  transaction_id: string;
  created_at?: string;
};

export type TransactionsStatusType =
  | "draft"
  | "awaiting"
  | "ongoing"
  | "partial"
  | "completed"
  | "cancelled";

export type TransactionsType = {
  id: string;
  status: TransactionsStatusType;
  quotation: QuotationsType;
  quotations_id: string;
  items: Partial<TransactionItemsType>[];
};

export function Transactions() {
  const [transactions, setTransactions] = useState<TransactionsType[]>([]);

  const TRANSACTION_URL =
    window.location.hostname == "localhost" ? "/pedidos/id#" : "/pedidos/id/#";

  function handleNewTransaction() {
    window.location.href = "/pedidos/novo";
  }

  useEffect(() => {
    fetchWithToken<{ transactions: TransactionsType[] }>({
      path: "/transactions",
    }).then((result) => {
      if (result.code == 200 || result.code == 201) {
        setTransactions(result.data.transactions);
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
          <h3 className={"text-xl font-semibold"}>Lista de pedidos abertos</h3>
          <Button text="Novo orçamento" onClick={handleNewTransaction} />
        </header>
        <Table>
          <THead
            collumns={[
              ["Código da ordem de serviço", "Referência"],
              ["Situação"],
            ]}
          />
          <tbody>
            {transactions.map((transaction) => (
              <Tr key={transaction.id}>
                <Td link={`${TRANSACTION_URL}${transaction.id}/`}>
                  <p className={""}>{transaction.quotation.slug}</p>
                  <p className={""}>{transaction.quotation.reference}</p>
                </Td>
                <Td link={`${TRANSACTION_URL}${transaction.id}/`}>
                  <p>{transaction.status}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
