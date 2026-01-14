export async function fetchPdf(path: string) {
  try {
    const DOMAIN = import.meta.env.PUBLIC_VPS_DOMAIN ?? "eseletrica.com.br";
    const url =
      window.location.hostname == "localhost"
        ? "http://localhost:3000"
        : `https://sistema.${DOMAIN}/api`;
    const response = await fetch(`${url}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("apiToken"),
      },
    });

    if (response.status != 200) {
      console.error(response);
      return null;
    }
    console.log(response.headers);

    const pdf = await response.blob();

    const disposition = response.headers.get("content-disposition");
    const fileName = disposition?.split("=")[1].replaceAll('"', "");

    const fileUrl = window.URL.createObjectURL(pdf);

    const tempLink = document.createElement("a");
    tempLink.href = fileUrl;
    tempLink.setAttribute("download", fileName || "documento");
    tempLink.setAttribute("hidden", "true");

    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    window.URL.revokeObjectURL(fileUrl);

    return null;
  } catch (error: any) {
    window.alert("Erro ao se comunicar com o servidor do sistema!");
    console.error(error);
    return null;
  }
}
