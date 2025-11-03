import { Table, Td, THead, Tr } from "@elements/Table";
import { fetchWithToken } from "@utils/fetchWithToken";
import { useEffect, useState } from "preact/hooks";
import { CreateUserModal } from "./CreateUserModal";

export type UsersType = {
  id: string;
  cpf: string;
  name: string;
  login: string;
  password: string;
  role: string;
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
        <header className={"flex justify-between items-center px-2 mb-2"}>
          <h3 className={"text-xl font-semibold"}>Lista de usuários</h3>
          <button
            className={"bg-blue-700 p-2 rounded-md text-white font-semibold"}
            onClick={handleNewUser}
          >
            Novo usuário
          </button>
        </header>
        <Table>
          <THead
            collumns={[["Nome", "CPF"], ["Login"], ["Celular"], ["Tipo"]]}
          />
          <tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{user.name}</p>
                  <p className={"text-green-700"}>{user.cpf ?? ""}</p>
                </Td>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{user.login}</p>
                </Td>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{user.phone_number}</p>
                </Td>
                <Td link={`${USER_URL}${user.id}/`}>
                  <p>{user.role || ""}</p>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
