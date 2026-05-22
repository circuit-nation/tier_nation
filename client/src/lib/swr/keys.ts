export const swrKeys = {
  lists: (page: number, limit: number, authKey: string) =>
    ['lists', page, limit, authKey] as const,
  list: (id: string, authKey: string) => ['list', id, authKey] as const,
  results: (listId: string, authKey: string) =>
    ['results', listId, authKey] as const,
  votesMe: (listId: string, authKey: string) =>
    ['votes', 'me', listId, authKey] as const,
  listStats: (listId: string) => ['list', 'stats', listId] as const,
  mySubmissions: (authKey: string) => ['me', 'submissions', authKey] as const,
  authSession: () => ['auth', 'session'] as const,
  oauthCallback: (search: string) => ['oauth', 'callback', search] as const,
  submitVotes: (listId: string) => ['votes', 'submit', listId] as const,
} as const;
