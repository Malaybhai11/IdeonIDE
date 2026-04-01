import { HTTPError } from "ky";

interface ErrorBody {
  error?: string;
  message?: string;
}

export const getHTTPErrorMessage = async (error: HTTPError) => {
  const rawBody = await error.response.text();

  if (!rawBody) {
    return undefined;
  }

  try {
    const body = JSON.parse(rawBody) as ErrorBody;
    return body.error ?? body.message ?? rawBody;
  } catch {
    return rawBody;
  }
};
