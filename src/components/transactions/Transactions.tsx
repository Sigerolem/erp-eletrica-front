import type { MaterialsType } from "@comp/materials/Materials";
import type { QuotationsType } from "@comp/quotations/Quotations";
import { Button } from "@elements/Button";
import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { formatTransactionStatusEnum } from "src/utils/formating";

export type TransactionItemsType = {
  id: string;
  name: string;
  expected_amount: number;
  separated_amount: number;
  taken_amount: number;
  returned_amount: number;
  unit_cost: number;
  unit_profit: number;
  unit_value: number;
  material_id: string;
  material: MaterialsType;
  transaction_id: string;
  created_at: string;
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
  quotation_id: string;
  items: TransactionItemsType[];
  created_at: string;
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
        <header className={"flex justify-between items-end mb-2"}>
          <h3 className={"text-lg font-semibold"}>Lista de pedidos abertos</h3>
          {/* <Button
            text="Novo orçamento"
            className={"bg-blue-700 text-white text-sm"}
            onClick={handleNewTransaction}
          /> */}
        </header>
        <Table>
          <THead
            collumns={[["Código da OS", "Referência da OS"], ["Situação"]]}
          />
          <tbody>
            {transactions.map((transaction) => (
              <Tr key={transaction.id}>
                <Td link={`${TRANSACTION_URL}${transaction.id}/`}>
                  <p className={""}>{transaction.quotation.slug}</p>
                  <p className={""}>{transaction.quotation.reference}</p>
                </Td>
                <Td link={`${TRANSACTION_URL}${transaction.id}/`}>
                  <p>{formatTransactionStatusEnum(transaction.status)}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
