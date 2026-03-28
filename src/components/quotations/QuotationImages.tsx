import type { TargetedInputEvent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { fetchWithToken } from "src/utils/fetchWithToken";
import type { QuotationImagesType } from "./Quotations";

interface QuotationImagesProps {
  quotationId: string;
}

export function QuotationImages({ quotationId }: QuotationImagesProps) {
  const [quotationImages, setQuotationImages] = useState<QuotationImagesType[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  async function fetchQuotationImages() {
    fetchWithToken<{ imgs: QuotationImagesType[] }>({
      path: `/quotation-media/quotation/${quotationId}`,
    }).then((result) => {
      if (result.code === 200) {
        console.log(result.data);
        setQuotationImages(result.data.imgs ?? []);
      } else {
        window.alert("Erro ao buscar imagens.");
      }
    });
  }

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
        const { code, data } = await fetchWithToken({
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

  const baseUrl =
    window.location.hostname == "localhost"
      ? "http://localhost:3000"
      : "https://sistema.eseletrica.com.br";

  function handleImgClick(imgToken: string) {
    window.open(`${baseUrl}/api/quotation-media/${imgToken}`, "_blank");
  }

  return (
    <div className="pt-2">
      <div className={"flex flex-col gap-1"}>
        <div className="-mt-2 items-center">
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
        </div>
        {error && (
          <span className="text-red-500 text-xs font-medium leading-3">
            {error}
          </span>
        )}
      </div>
      {quotationImages.length > 0 ? (
        <div className="pt-2">
          <span className="font-semibold text-sm leading-4 ml-1">Imagens</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
            {quotationImages.map((img) => (
              <div
                className={
                  "flex items-center justify-center border rounded-lg border-slate-400 max-h-60 overflow-hidden cursor-pointer"
                }
              >
                <img
                  src={`${baseUrl}/api/quotation-media/${img.token}`}
                  alt={img.name}
                  title={img.name}
                  className={"w-full h-full object-cover"}
                  onClick={() => handleImgClick(img.token!)}
                />
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
