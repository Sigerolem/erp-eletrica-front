import { useEffect, useState } from "preact/hooks";
import { fetchWithToken } from "src/utils/fetchWithToken";

type SupsNeedingPurchase = {
  id: string;
  name: string;
  materials: number;
};

const PURCHASE_URL =
  window.location.hostname == "localhost" ? "/gerar/id#" : "/gerar/id/#";

export function PurchaseGenerationSuppliers() {
  const [suppliers, setSuppliers] = useState<SupsNeedingPurchase[]>([]);

  useEffect(() => {
    fetchWithToken<{ suppliers: SupsNeedingPurchase[] }>({
      path: "/suppliers/need-purchase",
    }).then(({ code, data }) => {
      if (code == 200) {
        console.log(data);
        setSuppliers(data.suppliers);
      } else {
        window.alert("Erro ao buscar a lista de materiais");
        console.error(data);
      }
    });
  }, []);

  const xSize = window.innerWidth;
  return (
    <>
      <div className={"flex flex-col"}>
        <header className={"flex justify-between items-end mb-2"}>
          <h3 className={"text-lg font-semibold"}>
            Fornecedores com materiais em baixa quantidade
          </h3>
        </header>
        <section className={"flex flex-col items-start"}>
          {suppliers.map((sup) => (
            <a
              key={sup.id || "null"}
              href={`/compras${PURCHASE_URL}${sup.id}`}
              className={
                "flex justify-between w-full max-w-3xl p-2 text-xl font-semibold hover:border-2 hover:border-blue-500 hover:p-1.5 rounded-md"
              }
            >
              <div>
                <strong className={"text-xl text-blue-900"}>
                  {sup.name || "Sem fornecedor"}:
                </strong>
              </div>
              <div className={"min-w-30 text-right"}>
                <span className={""}>
                  {sup.materials}{" "}
                  {sup.materials == 1 ? "material" : "materiais"}
                </span>
              </div>
            </a>
          ))}
        </section>
      </div>
    </>
  );
}
