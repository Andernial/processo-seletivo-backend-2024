import axios from 'axios';
import FormData from 'form-data';

export async function axiosPost<Tvariables>(
  query: string,
  variables?: Tvariables,
  token?: string,
  formData?: FormData,
) {
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
