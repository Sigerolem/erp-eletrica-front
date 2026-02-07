import { useEffect, useState } from "preact/hooks";
import { Button } from "./Button";

export function UserCard() {
  const [name, setName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("apiName");
    setName(name || "");
  }, []);

  const handleLogoff = () => {
    window.localStorage.removeItem("apiToken");
    window.localStorage.removeItem("apiName");
    window.localStorage.removeItem("apiRole");
    window.localStorage.removeItem("apiPermissions");
    window.localStorage.removeItem("apiLogin");
    window.location.href = "/login";
  };

  return (
    <div className="relative">
      <div
        id="idCard"
        className="p-2 md:p-3 text-white font-semibold not-md:bg-slate-700/50 not-md:flex not-md:items-center cursor-pointer hover:bg-slate-700 transition-all flex items-center gap-3 group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-col">
          <p className="not-md:hidden text-xs text-slate-400 font-normal">
            Olá,
          </p>
          <span id="userName" className="not-md:p-1 truncate max-w-[120px]">
            {name || "..."}
          </span>
        </div>
      </div>

      {isModalOpen && (
        <section
          className="fixed top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-100 flex flex-col justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-blue-50 p-8 opacity-100 rounded-md max-w-70 mx-auto w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Opções</h2>
              <Button
                text="Voltar"
                className="bg-red-700 p-2 rounded-md font-semibold text-white"
                onClick={() => setIsModalOpen(false)}
              />
            </header>

            <div className="flex flex-col gap-3">
              <a href="/usuarios/alterar-senha" className="w-full">
                <Button
                  text="Alterar Senha"
                  className="w-full bg-blue-700 text-white p-2 rounded-md font-semibold shadow-md"
                />
              </a>
              <Button
                text="Sair da Conta"
                onClick={handleLogoff}
                className="w-full bg-slate-400 text-white p-2 rounded-md font-semibold shadow-md"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
