interface SuccessResponse<T> {
  code: 200 | 201;
  data: T;
}

interface ErrorResponse {
  code: 400 | 401 | 402 | 403 | 404 | 409 | 429 | 500 | 501;
  data: { error: Error | string; message: string };
}

type FetchResult<T> = SuccessResponse<T> | ErrorResponse;

async function checkInternetConnection(): Promise<boolean> {
  if (!window.navigator.onLine) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    // Ping Google with no-cors to check if the user has internet access
    await fetch("https://www.google.com/favicon.ico", {
      mode: "no-cors",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}

export async function fetchWithToken<T>({
  path,
  method = "GET",
  body,
}: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string | FormData;
}): Promise<FetchResult<T>> {
  let response: Response;

  const lastTokenDateString = localStorage.getItem("apiTokenDate");
  const todayDateString = new Date().toLocaleDateString();
  if (
    lastTokenDateString == undefined ||
    lastTokenDateString !== todayDateString
  ) {
    localStorage.removeItem("apiToken");
    window.location.href = "/login";
    console.warn("Sessão expirada");
  }

  try {
    const DOMAIN =
      import.meta.env.PUBLIC_SERVER_DOMAIN ?? "sistema.eseletrica.com.br";
    const url =
      window.location.hostname == "localhost"
        ? "http://localhost:3000/api"
        : `https://${DOMAIN}/api`;
    response = await fetch(`${url}${path}`, {
      method,
      headers: {
        "Content-Type":
          body instanceof FormData ? "multipart/form-data" : "application/json",
        authorization: "Bearer " + localStorage.getItem("apiToken"),
      },
      body,
    });
  } catch (error: any) {
    const isOnline = await checkInternetConnection();

    if (isOnline) {
      window.alert(
        "Erro ao se comunicar com o sistema! O servidor parece estar temporariamente fora do ar. Por favor, tente novamente em instantes.",
      );
    } else {
      window.alert(
        "Sua conexão com a internet parece estar instável ou offline. Verifique seu roteador ou cabo de rede.",
      );
    }

    console.error(error);

    return { data: { error: error, message: error.message }, code: 400 };
  }
  const data = await response.json();

  if (response.status == 401) {
    localStorage.removeItem("apiToken");
    window.location.href = "/login";
    console.warn("Unauthorized", data);
    return { code: 401, data: { error: data, message: "Unauthorized" } };
  }

  if (response.status == 403) {
    console.warn("Forbidden", data);
    window.alert("Você não tem permissão para realizar essa ação.");
    return { code: 403, data: { error: data, message: "Forbidden" } };
  }

  if (response.status == 429) {
    console.warn("Too many requests", data);
    window.alert(
      "Você excedeu o limite de requisições. Aguarde alguns segundos e atualize a página.",
    );
    return { code: 429, data: { error: data, message: "Too many requests" } };
  }

  if (response.status == 200 || response.status == 201) {
    return {
      code: response.status as 200 | 201,
      data: data as T,
    };
  }

  const error = data;

  console.error({ error, message: error.message, response });

  return {
    code: response.status as 400,
    data,
  };
}
