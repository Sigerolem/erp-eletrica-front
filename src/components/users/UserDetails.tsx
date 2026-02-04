import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import type { UsersType } from "./Users";
import { UserDataForm } from "./UserDataForm";
import { hasPermission } from "@utils/permissionLogic";

export function UserDetails() {
  const [user, setUser] = useState<UsersType | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");

    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "user", "R")
    ) {
      window.location.href = "/";
    }

    const path = new URL(window.location.href);
    const id = path.hash.replace("#", "").replaceAll("/", "");
    fetchWithToken<{ user: UsersType }>({
      path: `/users/${id}`,
    }).then((result) => {
      if (result.code == 200) {
        setUser(result.data.user);
      }
    });
  }, []);

  async function handleDataSubmition(userData: Partial<UsersType>) {
    const { code, data } = await fetchWithToken<{ user: UsersType }>({
      path: `/users/${user?.id}`,
      method: "PUT",
      body: JSON.stringify(userData),
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
    }
    return null;
  }

  return (
    <main>
      {user ? (
        <UserDataForm
          doOnSubmit={handleDataSubmition}
          userData={user ?? undefined}
        />
      ) : (
        <span className={"animate-bounce text-xl block mt-8 font-semibold"}>
          Carregando...
        </span>
      )}
    </main>
  );
}
