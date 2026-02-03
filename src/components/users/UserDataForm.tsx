import { useEffect, useState } from "preact/hooks";
import type { UsersRoleType, UsersType } from "./Users";
import type { TargetedSubmitEvent } from "preact";
import { Input } from "@elements/Input";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import { DataForm } from "@elements/DataForm";
import { RoleSelector } from "src/elements/RoleSelector";
import { PermissionSelector } from "src/elements/PermissionSelector";

export function UserDataForm({
  userData,
  doOnSubmit,
}: {
  doOnSubmit: (
    userData: Partial<UsersType>
  ) => Promise<{ [key: string]: string } | null>;
  userData?: UsersType;
}) {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UsersRoleType>("admin");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [permissions, setPermissions] = useState<string>("-----------------");
  console.log(permissions)
  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setCpf(userData.cpf);
      setLogin(userData.login);
      setRole(userData.role);
      setPermissions(userData.permissions);
      setPhoneNumber(userData.phone_number || "");
      setAddress(userData.address || "");
    }
  }, [userData]);

  async function onFormSubmit(e: TargetedSubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      window.alert("Só é possivel salvar com dados válidos.");
      return;
    }

    if (name == "") {
      setValidationErrors((prev) => ({
        ...prev,
        name: "Esse campo é obrigatório.",
      }));
      return;
    }
    if (cpf == "") {
      setValidationErrors((prev) => ({
        ...prev,
        cpf: "Esse campo é obrigatório.",
      }));
      return;
    }
    if (login == "") {
      setValidationErrors((prev) => ({
        ...prev,
        login: "Esse campo é obrigatório.",
      }));
      return;
    }

    let userData = {
      name,
      address: address || null,
      phone_number: phoneNumber || null,
      cpf,
      login,
      password: password as string | undefined,
      role,
      permissions
    };

    if (password == "") {
      if (userData == undefined) {
        setValidationErrors((prev) => ({
          ...prev,
          password: "Esse campo é obrigatório.",
        }));
        return;
      } else {
        delete userData.password;
      }
    }

    const errors = await doOnSubmit(userData);

    if (errors) {
      setValidationErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  return (
    <DataForm onSubmit={onFormSubmit}>
      <div className={"flex gap-4"}>
        <Input
          label="Nome do usuário"
          name="name"
          errors={validationErrors}
          value={name}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setName, setValidationErrors, {
              min: 4,
              max: 100,
              required: true,
            });
          }}
        />
        <Input
          label="CPF"
          name="cpf"
          errors={validationErrors}
          value={cpf}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setCpf, setValidationErrors, {
              min: 9,
              max: 15,
              required: true,
            });
          }}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Login"
          name="login"
          errors={validationErrors}
          value={login}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setLogin, setValidationErrors, {
              min: 5,
              max: 50,
              required: true,
            });
          }}
        />
        <Input
          label="Senha"
          name="password"
          errors={validationErrors}
          value={password}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setPassword, setValidationErrors, {
              min: 4,
              max: 50,
              required: true,
            });
          }}
        />
      </div>
      <div className={"flex gap-4"}>
        <Input
          label="Celular"
          name="phone_number"
          errors={validationErrors}
          value={phoneNumber}
          onBlur={(e) => {
            validateStringFieldOnBlur(e, setPhoneNumber, setValidationErrors, {
              min: 0,
              max: 15,
              required: false,
            });
          }}
        />
        <RoleSelector
          label="Função"
          value={role}
          doOnSelect={(v) => {
            if (v === "owner") {
              setPermissions("M".repeat(15));
            } else {
              setPermissions("-".repeat(15))
            }
            setRole(v as UsersRoleType)
          }}
        />
      </div>
      <Input
        label="Endereço"
        name="address"
        type="text"
        errors={validationErrors}
        value={address}
        onBlur={(e) => {
          validateStringFieldOnBlur(e, setAddress, setValidationErrors, {
            min: 0,
            max: 150,
            required: false,
          });
        }}
      />
      {
        role !== "owner" && (
          <div className={"grid grid-cols-4 gap-2 not-sm:grid-cols-2"}>
            <PermissionSelector
              label="Usuários"
              value={permissions}
              index={0}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Fornecedores"
              value={permissions}
              index={1}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Materiais"
              value={permissions}
              index={2}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Compras"
              value={permissions}
              index={3}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Clientes"
              value={permissions}
              index={4}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Orçamentos"
              value={permissions}
              index={5}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Ordens"
              value={permissions}
              index={6}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Pedidos"
              value={permissions}
              index={7}
              setPermissions={setPermissions}
            />
            <PermissionSelector
              label="Serviços"
              value={permissions}
              index={8}
              setPermissions={setPermissions}
            />
          </div>
        )
      }

      <div className={"flex gap-4 justify-end"}>
        <button
          className={
            "bg-blue-800 p-2 max-w-2xl rounded-md font-semibold text-white"
          }
          type={"submit"}
        >
          Salvar
        </button>
      </div>
    </DataForm>
  );
}
