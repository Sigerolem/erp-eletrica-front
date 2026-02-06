import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { Button } from "src/elements/Button";
import { DataForm } from "src/elements/DataForm";
import { Input } from "src/elements/Input";
import type { UsersType } from "./Users";
import type { TargetedSubmitEvent } from "preact";

export function ChangePassword() {
  const [login, setLogin] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    const login = localStorage.getItem("apiLogin");

    if (login == undefined) {
      window.location.href = "/";
    } else {
      setLogin(login);
    }
  }, []);

  async function handleChangePassword(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (oldPassword == "" || newPassword == "" || confirmPassword == "") {
      window.alert("Preencha todos os campos");
      return;
    }
    if (newPassword != confirmPassword) {
      window.alert("As senhas não coincidem");
      return;
    }
    const { code, data } = await fetchWithToken<{ user: UsersType }>({
      path: `/users/password/${login}`,
      method: "PUT",
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });

    if (code == 200) {
      window.location.href = "/";
    } else {
      window.alert("Erro ao alterar senha");
    }

    return null;
  }

  return (
    <div className={"flex justify-center w-full "}>
      <DataForm
        onSubmit={handleChangePassword}
        className={"w-full max-w-lg gap-4"}
      >
        <Input
          label="Senha Antiga"
          name="oldPassword"
          type="password"
          value={oldPassword}
          onBlur={(e) => setOldPassword(e.currentTarget.value)}
        />

        <Input
          label="Senha Nova"
          name="newPassword"
          type="password"
          value={newPassword}
          onBlur={(e) => setNewPassword(e.currentTarget.value)}
        />
        <Input
          label="Confirmar Senha Nova"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onBlur={(e) => setConfirmPassword(e.currentTarget.value)}
        />
        <Button type="submit" text="Alterar Senha" />
      </DataForm>
    </div>
  );
}
