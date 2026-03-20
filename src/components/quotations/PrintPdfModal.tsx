import { Button } from "@elements/Button";
import { useEffect, useState } from "preact/hooks";
import { fetchPdf } from "@utils/fetchPdf";
import type { QuotationsStatusType } from "./Quotations";
import { hasPermission } from "@utils/permissionLogic";
import { Portal } from "src/elements/Portal";

export function PrintPdfModal({
  closeModal,
  quotationId,
  quotationStatus,
}: {
  closeModal: () => void;
  quotationId: string;
  quotationStatus: QuotationsStatusType;
}) {
  const [mode, setMode] = useState("LLL");
  const [canSeeNumbers, setCanSeeNumbers] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isNotOrderYet = ["q_awaiting", "q_approved", "denied"].includes(
      quotationStatus ?? "q_awaiting",
    );
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role != "owner" &&
      !hasPermission(permission ?? "----------------", "quotation", "R") &&
      !hasPermission(permission ?? "----------------", "order", "R")
    ) {
      window.location.href = "/";
      return;
    }
    if (
      role == "owner" ||
      hasPermission(
        permission ?? "----------------",
        isNotOrderYet ? "quotation" : "order",
        "W",
      )
    ) {
      setCanSeeNumbers(true);
      setMode("FFF");
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleDownload() {
    setLoading(true);
    await fetchPdf(`/quotations/print/${quotationId}?mode=${mode}`);
    setLoading(false);
    closeModal();
  }

  const xSize = window.innerWidth;
  return (
    <Portal>
      <section className={"fixed top-0 left-0 w-full h-full"}>
        <div
          className={`fixed top-0 left-0 w-full h-full flex items-center justify-center ${
            xSize < 700 ? "p-8" : "p-32"
          } bg-[#000000AA] z-20`}
          onClick={closeModal}
        >
          <div
            className={
              "bg-blue-50 rounded-md p-4 border flex flex-col gap-2 items-baseline max-w-xl"
            }
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <strong className={"pb-4 text-lg block"}>Detalhes do PDF</strong>
            <div className={"grid grid-cols-2 gap-y-6 w-full items-center"}>
              <span className={"font-semibold text-lg"}>Serviços</span>
              <select
                className={
                  "bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-50"
                }
                onChange={(e) => {
                  setMode(`${e.currentTarget.value}${mode[1]}${mode[2]}`);
                }}
                value={mode[0]}
              >
                <optgroup label={"Selecione:"}>
                  {canSeeNumbers && <option value="F">Completo</option>}
                  <option value="L">Lista</option>
                  <option value="H">Oculto</option>
                </optgroup>
              </select>
              <span className={"font-semibold text-lg"}>Matériais</span>
              <select
                className={
                  "bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-50"
                }
                onChange={(e) => {
                  setMode(`${mode[0]}${e.currentTarget.value}${mode[2]}`);
                }}
                value={mode[1]}
              >
                <optgroup label={"Selecione:"}>
                  {canSeeNumbers && <option value="F">Completo</option>}
                  <option value="L">Lista</option>
                  <option value="H">Oculto</option>
                </optgroup>
              </select>
              <span className={"font-semibold text-lg"}>Despesas</span>
              <select
                className={
                  "bg-white border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-50"
                }
                onChange={(e) => {
                  setMode(`${mode[0]}${mode[1]}${e.currentTarget.value}`);
                }}
                value={mode[2]}
              >
                <optgroup label={"Selecione:"}>
                  <option value="F">Completo</option>
                  <option value="L">Lista</option>
                  <option value="H">Oculto</option>
                </optgroup>
              </select>

              {/* <Input
              name="search"
              placeholder={"Nome do fornecedor"}
              onBlur={(e) => {
                validateStringFieldOnBlur(e, setSearch, setValidationErrors, {
                  min: 2,
                });
              }}
              errors={validationErrors}
              className={"min-h-10 text-lg"}
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  const button = document.querySelector<HTMLButtonElement>(
                    "[name='searchButton']",
                  );
                  if (button) {
                    e.currentTarget.blur();
                    setTimeout(() => {
                      button.click();
                    }, 100);
                  }
                }
              }}
            /> */}
              <div
                className={`col-span-2 flex justify-end ${loading && "animate-pulse"}`}
              >
                <Button
                  name="searchButton"
                  onClick={handleDownload}
                  text={loading ? "Gerando..." : "Baixar"}
                  disabled={loading}
                  className={"bg-blue-600 text-white disabled:cursor-wait!"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Portal>
  );
}
