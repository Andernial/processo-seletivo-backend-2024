import axios from 'axios';
import FormData from 'form-data';

interface AxiosOptions<Tvariables> {
  query: string;
  token?: string;
  formData?: FormData;
  variables?: Tvariables;
}

export async function axiosPost<Tvariables>({ query, token, formData, variables }: AxiosOptions<Tvariables>) {
  try {
    let headers;
    const url = `http://localhost:${process.env.PORT}/graphql`;
    if (formData) {
      headers = {
        ...formData.getHeaders(),
        Authorization: token ? token : undefined,
        'Apollo-Require-Preflight': true,
      };
    }

    const response = await axios.post(
      url,
      formData ? formData : { query: query, variables: variables ? variables : undefined },
      formData
        ? { headers }
        : {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? token : undefined,
            },
          },
    );

    return response;
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error)) {
      console.log(error.response.data);
    }
  }
}
