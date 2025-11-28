import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Button } from "@elements/Button";
import type { TransactionsType } from "./Transactions";
import { TransactionDataForm } from "./TransactionDataForm";

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
        setTransaction(result.data.transaction);
      }
    });
  }, []);

  async function handleDataSubmition(materialData: Partial<TransactionsType>) {
    // const { code, data } = await fetchWithToken<{ supplier: TransactionsType }>({
    //   path: `/materials/${material?.id}`,
    //   method: "PUT",
    //   body: JSON.stringify(materialData),
    // });

    // if (code == 409) {
    //   const errors = {} as { [key: string]: string };
    //   if (data.message.includes("entity.name")) {
    //     errors.name = "Esse nome já foi utilizado";
    //   } else if (data.message.includes("entity.cnpj")) {
    //     errors.cnpj = "Esse CNPJ já foi cadastrado";
    //   }
    //   return errors;
    // }

    // if (code == 200 || code == 201) {
    //   window.alert("Altterações salvas");
    //   return null;
    // }

    return { erro: "Alguma coisa" };
  }

  return (
    <main>
      {transaction ? (
        <TransactionDataForm
          doOnSubmit={handleDataSubmition}
          transactionData={transaction}
        >
          <Button text="Salvar" type={"submit"} />
        </TransactionDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
