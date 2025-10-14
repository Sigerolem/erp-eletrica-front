import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import type { SuppliersType } from "./Suppliers";
import { SupplierDataForm } from "./SupplierDataForm";

export function SupplierDetails() {
  const [supplier, setSupplier] = useState<SuppliersType | null>(null);

  useEffect(() => {
    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "");
    fetchWithToken<{ supplier: SuppliersType }>({
      path: `/suppliers/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setSupplier(result.data.supplier);
      }
    });
  }, []);

  async function handleDataSubmition(supplierData: Omit<SuppliersType, "id">) {
    const { code, data } = await fetchWithToken<{ supplier: SuppliersType }>({
      path: `/suppliers/${supplier?.id}`,
      method: "PATCH",
      body: JSON.stringify(supplierData),
    });

    if (code == 409) {
      const errors = {} as { [key: string]: string };
      if (data.error.includes("entity.name")) {
        errors.name = "Esse nome já foi utilizado";
      } else if (data.error.includes("entity.cnpj")) {
        errors.cnpj = "Esse CNPJ já foi cadastrado";
      }
      return errors;
    }

    if (code == 200 || code == 201) {
      window.alert("Altterações salvas");
      console.log(code, data);
    }
  }

  return (
    <main>
      {supplier ? (
        <SupplierDataForm
          doOnSubmit={handleDataSubmition}
          supplierData={supplier ?? undefined}
        />
      ) : (
        <span className={"animate-bounce text-2xl block mt-4"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
