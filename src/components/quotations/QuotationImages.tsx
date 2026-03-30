import type { TargetedInputEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { fetchWithToken } from "@utils/fetchWithToken";
import type { QuotationImagesType } from "./Quotations";
import { hasPermission } from "@utils/permissionLogic";

interface QuotationImagesProps {
  quotationId: string;
}

export function QuotationImages({ quotationId }: QuotationImagesProps) {
  const [quotationImages, setQuotationImages] = useState<QuotationImagesType[]>(
    [],
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [userCanDeleteSomeImages, setUserCanDeleteSomeImages] = useState(false);
  const [userCanDeleteAllImages, setUserCanDeleteAllImages] = useState(false);
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  async function fetchQuotationImages() {
    const userId = localStorage.getItem("apiUserId");
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    setUserId(userId);
    fetchWithToken<{ imgs: QuotationImagesType[] }>({
      path: `/quotation-media/quotation/${quotationId}`,
    }).then((result) => {
      if (result.code === 200) {
        setUserCanDeleteSomeImages(
          result.data.imgs.some((img) => img.uploader_id == userId),
        );
        setQuotationImages(result.data.imgs ?? []);
      } else {
        window.alert("Erro ao buscar imagens.");
      }
    });
  }

  useEffect(() => {
    const role = localStorage.getItem("apiRole");
    const permission = localStorage.getItem("apiPermissions");
    if (
      role === "owner" ||
      hasPermission(permission ?? "----------------", "order", "D")
    ) {
      setUserCanDeleteAllImages(true);
    }
  }, []);

  useEffect(() => {
    fetchQuotationImages();
  }, [quotationId]);

  async function handleInputChange(e: TargetedInputEvent<HTMLInputElement>) {
    setError(null);
    const inputElement = e.currentTarget;
    const files = e.currentTarget.files;
    if (!files) return;

    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > MAX_FILE_SIZE_BYTES,
    );

    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map((f) => f.name).join(", ");
      setError(`Imagem com mais de ${MAX_FILE_SIZE_MB}MB: ${names}`);
      e.currentTarget.value = "";
    } else {
      let wasSuccess = true;
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const { code } = await fetchWithToken({
          path: `/quotations/${quotationId}/upload-image`,
          method: "POST",
          body: formData,
        });
        if (code !== 201) {
          wasSuccess = false;
          break;
        }
      }

      if (wasSuccess) {
        inputElement.value = "";
        fetchQuotationImages();
        window.alert("Imagens enviadas com sucesso.");
      }
    }
  }

  async function handleDeleteImage(id: string) {
    if (
      !confirm(
        "Tem certeza que deseja deletar esta imagem imediatamente? \nEsta ação não pode ser desfeita.",
      )
    )
      return;
    setIsDeleting(true);
    const { code } = await fetchWithToken({
      path: `/quotation-media/${id}`,
      method: "DELETE",
    });
    setIsDeleting(false);
    if (code === 200) {
      fetchQuotationImages();
      window.alert("Imagem deletada com sucesso.");
    } else {
      window.alert("Erro ao deletar imagem.");
    }
  }

  const baseUrl =
    window.location.hostname == "localhost"
      ? "http://localhost:3000"
      : "https://sistema.eseletrica.com.br";

  function handleImgClick(imgToken: string) {
    window.open(`${baseUrl}/api/quotation-media/${imgToken}`, "_blank");
  }

  return (
    <div className="pt-2">
      <div className={"flex gap-3"}>
        <div className="-mt-2 items-center w-full">
          <span className="font-semibold text-sm leading-4 ml-1">
            Adicionar imagens
          </span>
          <input
            className={`w-full border ${error ? "border-red-500" : "border-slate-400"} rounded p-1 text-sm`}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            multiple
            onChange={handleInputChange}
          />
          {error && (
            <span className="text-red-500 text-xs font-medium leading-3">
              {error}
            </span>
          )}
        </div>
        {(userCanDeleteSomeImages || userCanDeleteAllImages) && (
          <div
            className={`flex items-center justify-center rounded-lg border border-slate-400 min-w-10 ${showDeleteButton && "bg-blue-600"}`}
            onClick={() => {
              setShowDeleteButton(!showDeleteButton);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke={showDeleteButton ? "white" : "black"}
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 1.065 1.065 2.828 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.533 1.756-2.644 1.756-3.178 0a1.724 1.724 0 0 0-2.572-1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.533-1.756-2.644 0-3.178a1.724 1.724 0 0 0 1.065-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
              />
            </svg>
          </div>
        )}
      </div>
      {quotationImages.length > 0 ? (
        <div className="pt-2">
          <span className="font-semibold text-sm leading-4 ml-1">Imagens</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
            {quotationImages.map((img) => (
              <div
                className={
                  "flex items-center relative justify-center border rounded-lg border-slate-400 max-h-60 overflow-hidden cursor-pointer"
                }
              >
                <img
                  src={`${baseUrl}/api/quotation-media/${img.token}`}
                  alt={img.name}
                  title={img.name}
                  className={"w-full h-full object-cover"}
                  onClick={() => handleImgClick(img.token!)}
                />
                {showDeleteButton &&
                  (img.uploader_id === userId || userCanDeleteAllImages) && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 disabled:cursor-wait!"
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={isDeleting}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <span className="font-semibold text-sm leading-4 ml-1">Imagens</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
            <span className="text-sm leading-4 ml-1">Nenhuma imagem</span>
          </div>
        </div>
      )}
    </div>
  );
}
