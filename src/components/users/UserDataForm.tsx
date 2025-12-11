import { useEffect, useState } from "preact/hooks";
import type { UsersRoleType, UsersType } from "./Users";
import type { TargetedSubmitEvent } from "preact";
import { Input } from "@elements/Input";
import { validateStringFieldOnBlur } from "@utils/inputValidation";
import { DataForm } from "@elements/DataForm";

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

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setCpf(userData.cpf);
      setLogin(userData.login);
      setRole(userData.role);
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
        <Input
          label="Função"
          name="role"
          errors={validationErrors}
          value={role}
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
