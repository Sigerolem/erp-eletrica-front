import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import type { SuppliersType } from "./Suppliers";
import { SupplierDataForm } from "./SupplierDataForm";
import { Button } from "@elements/Button";
import { hasPermission } from "src/utils/permissionLogic";

export function SupplierDetails() {
  const [supplier, setSupplier] = useState<SuppliersType | null>(null);
  const [userCanEditSupplier, setUserCanEditSupplier] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");

    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "supplier", "R")
    ) {
      window.location.href = "/";
    }

    if (
      role == "owner" ||
      hasPermission(permission ?? "----------------", "supplier", "W")
    ) {
      setUserCanEditSupplier(true);
    }

    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
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
      method: "PUT",
      body: JSON.stringify(supplierData),
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
      console.log(code, data);
    }
  }

  return (
    <main>
      {supplier ? (
        <SupplierDataForm
          doOnSubmit={handleDataSubmition}
          supplierData={supplier ?? undefined}
        >
          {userCanEditSupplier ? (
            <Button text="Salvar" type={"submit"} />
          ) : (
            <></>
          )}
        </SupplierDataForm>
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
