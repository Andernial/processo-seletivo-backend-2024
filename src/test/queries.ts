export const userMutation = {
  query: `mutation CreateUser($createUserInput: UserInput!) {
    createUser(data: $createUserInput) {
      birthDate
      email
      id
      name
    }
  }`,
};

export const userQuery = {
  query: `query User($userId: Int!) {
    user(id: $userId) {
      userData {
        id
        name
        email
        birthDate
      }
      address {
        id
        city
        complement
        cep
        neighborhood
        state
        street
        userId
        streetNumber
      }
    }
  }`,
};

export const usersQuery = {
  query: `query getUsers($usersInput: PaginationInput) {
   users(data: $usersInput) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      nextCursor
    }
    usersData {
        userData {
        birthDate
        email
        id
        name
        }
      address {
        cep
        city
        complement
        id
        neighborhood
        state
        street
        streetNumber
        userId
      }
    }
      usersTotal
  }
  }`,
};

export const loginMutation = {
  query: `mutation Login($loginInput: LoginInput!) {
    login(data: $loginInput) {
      user {
      name
      birthDate
      email
      id
      }
  token
}
}`,
};

export const addressMutation = {
  query: `mutation CreateAddress($createAddressInput: AddressInput!) {
  createAddress(data: $createAddressInput) {
    cep
    city
    complement
    id
    neighborhood
    state
    street
    streetNumber
    userId
  }
}`,
};
