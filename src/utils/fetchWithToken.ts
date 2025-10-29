interface SuccessResponse<T> {
  code: 200 | 201;
  data: T;
}

interface ErrorResponse {
  code: 400 | 401 | 402 | 404 | 409 | 500 | 501;
  data: { error: Error | string; message: string };
}

type FetchResult<T> = SuccessResponse<T> | ErrorResponse;

export async function fetchWithToken<T>({
  path,
  method = "GET",
  body,
}: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
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
    const url =
      window.location.hostname == "localhost"
        ? "http://localhost:3000"
        : "https://sigerolem.vps-kinghost.net";
    response = await fetch(`${url}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("apiToken"),
      },
      body,
    });
  } catch (error: any) {
    window.alert("Erro ao se comunicar com o servidor do sistema!");
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

  if (response.status == 200 || response.status == 201) {
    return {
      code: response.status as 200 | 201,
      data: data as T,
    };
  }

  console.error({ error: data, response });

  return {
    code: response.status as 400,
    data,
  };
}
