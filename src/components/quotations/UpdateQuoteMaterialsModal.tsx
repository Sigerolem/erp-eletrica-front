import { Button } from "@elements/Button";
import { Portal } from "@elements/Portal";
import { useEffect, useRef } from "preact/hooks";
import { fetchWithToken } from "src/utils/fetchWithToken";
import type { QuotationsType } from "./Quotations";

export function UpdateQuoteMaterialsModal({
  closeModal,
  quotationId,
}: {
  quotationId: string;
  closeModal: () => void;
}) {
  const closeModalRef = useRef(closeModal);
  useEffect(() => {
    closeModalRef.current = closeModal;
  }, [closeModal]);

  useEffect(() => {
    const modalId = `modal-${Math.random().toString(36).substring(2, 9)}`;
    window.history.pushState({ modalId }, "");
    const handlePopState = () => {
      closeModalRef.current();
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleEsc);

      if (window.history.state?.modalId === modalId) {
        window.history.back();
      }
    };
  }, []);

  async function updateCosts(alsoValue?: boolean) {
    const confirm = window.confirm(
      alsoValue
        ? "Tem certeza que deseja atualizar os custos e valores? Com isso serão perdidos os custos originais e o valor do orçamento será alterado para o cliente."
        : "Tem certeza que deseja atualizar os custos? Com isso serão perdidos os custos originais.",
    );
    if (!confirm) {
      return;
    }
    const res = await fetchWithToken<{ quotation: QuotationsType }>({
      path: `/quotations/${quotationId}/update-materials-costs${alsoValue ? "?updateValues=true" : ""}`,
      method: "PATCH",
    });
    if (res.code == 200) {
      window.alert("Custos atualizados com sucesso!");
      window.history.back();
      window.location.reload();
    } else {
      window.alert("Erro ao atualizar custos!");
    }
  }

  return (
    <>
      <Portal>
        <section
          className="fixed top-0 left-0 w-full h-full p-10 bg-[#000000AA] z-100 flex flex-col justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-blue-50 p-8 opacity-100 rounded-md max-w-80 mx-auto w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Opções</h2>
              <Button
                text="Voltar"
                className="bg-slate-600 p-2 rounded-md font-semibold text-white"
                onClick={closeModal}
              />
            </header>

            <div className="flex flex-col gap-3">
              <Button
                text="Atualizar custos dos materiais"
                className="w-full bg-blue-700 text-white p-2 rounded-md font-semibold shadow-md"
                onClick={() => {
                  updateCosts();
                }}
              />
              <Button
                text="Atualizar custos e valores"
                onClick={() => {
                  updateCosts(true);
                }}
                className="w-full bg-blue-700 text-white p-2 rounded-md font-semibold shadow-md"
              />
            </div>
          </div>
        </section>
      </Portal>
    </>
  );
}
