import { Button } from "@elements/Button";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { TransactionDataForm } from "./TransactionDataForm";
import type { TransactionsType } from "./Transactions";

export function TransactionDetails() {
  const [transaction, setTransaction] = useState<TransactionsType | null>(null);

  useEffect(() => {
    const path = new URL(window.location.href);

    const id = path.hash.replace("#", "").replaceAll("/", "");
    // : path.pathname.replace("/materiais/id/", "");

    fetchWithToken<{ transaction: TransactionsType }>({
      path: `/transactions/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        console.log(result.data.transaction);
        setTransaction(result.data.transaction);
      }
    });
  }, []);

  const TRANSACTION_DELIVERY_URL =
    window.location.hostname == "localhost"
      ? "/pedidos/separar/id#"
      : "/pedidos/separar/id/#";

  const TRANSACTION_RETURN_URL =
    window.location.hostname == "localhost"
      ? "/pedidos/devolver/id#"
      : "/pedidos/devolver/id/#";

  async function handleDataSubmition(
    transactionData: Partial<TransactionsType>
  ) {
    const { code, data } = await fetchWithToken<{
      transaction: TransactionsType;
    }>({
      path: `/transactions/${transaction?.id}`,
      method: "PUT",
      body: JSON.stringify({ status: "" }),
    });

    if (code == 409) {
      const errors = {} as { [key: string]: string };
      if (data.message.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.message.includes("entity.cnpj")) {
        errors.cnpj = "Esse CNPJ já foi cadastrado";
      }
      return errors;
    }

    if (code == 200 || code == 201) {
      window.alert("Altterações salvas");
      return null;
    }

    return { erro: "Alguma coisa" };
  }

  async function handleConfirmDelivery() {
    const { code, data } = await fetchWithToken<{
      transaction: TransactionsType;
    }>({
      path: `/transactions/${transaction?.id}`,
      method: "PATCH",
      body: JSON.stringify({
        status: "delivered",
        id: transaction?.id,
      }),
    });
    if (code == 200) {
      window.location.href = "/pedidos";
    } else {
      window.alert("Erro ao confirmar a entrega");
      console.error(data);
    }
  }

  async function handleConfirmReturn() {
    const { code, data } = await fetchWithToken<{
      transaction: TransactionsType;
    }>({
      path: `/transactions/${transaction?.id}`,
      method: "PATCH",
      body: JSON.stringify({
        status: "completed",
        id: transaction?.id,
      }),
    });
    if (code == 200) {
      window.location.href = "/pedidos";
    } else {
      window.alert("Erro ao confirmar a devolução");
      console.error(data);
    }
  }

  return (
    <main>
      {transaction ? (
        <TransactionDataForm
          doOnSubmit={handleDataSubmition}
          transactionData={transaction}
        >
          <div className={"flex justify-around"}>
            {transaction.status !== "draft" &&
              transaction.status !== "returning" &&
              transaction.status !== "completed" && (
                <a href={`${TRANSACTION_DELIVERY_URL}${transaction.id}`}>
                  <Button
                    text={
                      transaction.status == "awaiting"
                        ? "Iniciar separação"
                        : "Realizar nova separação"
                    }
                    type={"submit"}
                  />
                </a>
              )}
            {transaction.status == "ongoing" && (
              <Button
                text="Confirmar entrega"
                className={"bg-slate-600 text-white"}
                onClick={handleConfirmDelivery}
              />
            )}
            {(transaction.status == "completed" ||
              transaction.status == "delivered") && (
              <a href={`${TRANSACTION_RETURN_URL}${transaction.id}`}>
                <Button
                  text="Registrar devolução"
                  className={"bg-blue-700 text-white"}
                />
              </a>
            )}
            {transaction.status == "returning" && (
              <Button
                text="Confirmar devolução"
                className={"bg-slate-600 text-white"}
                onClick={handleConfirmReturn}
              />
            )}
          </div>
        </TransactionDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
