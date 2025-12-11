import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { CreateUserModal } from "./CreateUserModal";
import { Button } from "src/elements/Button";
import { formatUserRoleEnum } from "src/utils/formating";

export type UsersRoleType = "admin" | "owner" | "employee" | "guest";

export type UsersType = {
  id: string;
  cpf: string;
  name: string;
  login: string;
  password: string;
  role: UsersRoleType;
  address: string | null;
  phone_number: string | null;
};

export function Users() {
  const [users, setUsers] = useState<UsersType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const USER_URL =
    window.location.hostname == "localhost"
      ? "/usuarios/id#"
      : "/usuarios/id/#";

  function handleNewUser() {
    setIsModalOpen(true);
  }

  useEffect(() => {
    fetchWithToken<{ users: UsersType[] }>({ path: "/users" }).then(
      (result) => {
        if (result.code == 200 || result.code == 201) {
          setUsers(result.data.users);
        } else {
          window.alert("Erro ao buscar usuários.");
          console.error(result.data, result.code);
        }
      }
    );
  }, []);

  return (
    <main>
      {isModalOpen ? (
        <CreateUserModal
          closeModal={() => {
            setIsModalOpen(false);
          }}
          setUsers={setUsers}
        />
      ) : null}
      <div>
        <header className={"flex justify-between items-end mb-2"}>
          <h3 className={"text-lg font-semibold"}>Lista de usuários</h3>
          <Button
            text="Novo usuário"
            className={"bg-blue-700 text-white text-sm"}
            onClick={handleNewUser}
          />
        </header>
        <Table>
          <THead collumns={[["Nome", "CPF"], ["Login", "Celular"], ["Tipo"]]} />
          <tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{user.name}</p>
                  <p className={"text-sm font-semibold"}>{user.cpf ?? ""}</p>
                </Td>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{user.login}</p>
                  <p>{user.phone_number}</p>
                </Td>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{formatUserRoleEnum(user.role) || ""}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
      <Button
        text="Logoff"
        className={"bg-red-800 text-white mt-8"}
        onClick={() => {
          localStorage.removeItem("apiToken");
          window.location.href = "/login";
        }}
      />
    </main>
  );
}
