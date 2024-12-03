import axios from 'axios';

export async function axiosPost<Tvariables>(query: string, variables?: Tvariables, token?: string) {
  try {
    const response = await axios.post(
      `http://localhost:${process.env.PORT}/graphql`,
      { query: query, variables: variables ? variables : undefined },
      {
        headers: { 'Content-Type': 'application/json', Authorization: token ? token : undefined },
      },
    );

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response.data);
    }
  }
}
