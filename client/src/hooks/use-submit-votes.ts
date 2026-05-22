import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';

import type { ApiPostVotesBody } from '@/lib/api/types';
import { postVotes } from '@/lib/api/votes';
import { swrKeys } from '@/lib/swr/keys';

export type SubmitVotesArg = {
  listId: string;
  isAnonymous: boolean;
  votes: ApiPostVotesBody['votes'];
  accessToken: string;
};

async function submitVotesMutation(
  _key: ReturnType<typeof swrKeys.submitVotes>,
  { arg }: { arg: SubmitVotesArg }
) {
  return postVotes(
    {
      listId: arg.listId,
      isAnonymous: arg.isAnonymous,
      votes: arg.votes,
    },
    arg.accessToken
  );
}

export function invalidateResultsForList(listId: string) {
  return mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === 'results' || key[0] === 'votes' || key[0] === 'list') &&
      key.includes(listId),
    undefined,
    { revalidate: true }
  );
}

export function useSubmitVotes(listId: string) {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    swrKeys.submitVotes(listId),
    submitVotesMutation
  );

  const submit = async (arg: SubmitVotesArg) => {
    const result = await trigger(arg);
    await invalidateResultsForList(arg.listId);
    return result;
  };

  return {
    submit,
    isSubmitting: isMutating,
    submitError:
      error instanceof Error ? error.message : error ? String(error) : null,
    resetSubmitError: reset,
  };
}
