export const swrKeys = {
  lists: (page: number, limit: number) => ['lists', page, limit] as const,
  list: (id: string) => ['list', id] as const,
  results: (listId: string, authKey: string) =>
    ['results', listId, authKey] as const,
  authSession: () => ['auth', 'session'] as const,
  oauthCallback: (search: string) => ['oauth', 'callback', search] as const,
  submitVotes: (listId: string) => ['votes', 'submit', listId] as const,
} as const;
