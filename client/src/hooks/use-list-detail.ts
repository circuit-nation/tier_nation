import useSWR from 'swr';

import { useAuth } from '@/hooks/use-auth';
import {
  apiListDetailToList,
  fetchListById,
  isFullUserStatus,
} from '@/lib/api/lists';
import type { ApiEntitySummary, ApiUserStatus } from '@/lib/api/types';
import { swrKeys } from '@/lib/swr/keys';
import type { Entity, List } from '@/types';

function entitiesFromApi(rows: ApiEntitySummary[]): Entity[] {
  return rows.map((e) => ({
    id: e.id,
    name: e.name,
    team: e.team,
    tags: e.tags,
    imageUrl: e.imageUrl,
    description: e.description,
    sortOrder: e.sortOrder,
  }));
}

type ListDetailData = {
  list: List;
  entities: Entity[];
  userStatus: ApiUserStatus | null;
};

async function fetchListDetail(
  listId: string,
  accessToken: string | null
): Promise<ListDetailData> {
  const detail = await fetchListById(listId, accessToken);
  const userStatus =
    detail.userStatus && isFullUserStatus(detail.userStatus)
      ? detail.userStatus
      : null;

  return {
    list: apiListDetailToList(detail),
    entities: entitiesFromApi(detail.entities),
    userStatus,
  };
}

export function useListDetail(listId?: string) {
  const { accessToken } = useAuth();
  const authKey = accessToken ?? 'anon';

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    listId ? swrKeys.list(listId, authKey) : null,
    () => fetchListDetail(listId!, accessToken)
  );

  return {
    list: data?.list ?? null,
    entities: data?.entities ?? null,
    userStatus: data?.userStatus ?? null,
    loadError:
      error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: Boolean(listId) && (isLoading || (isValidating && !data)),
    mutate,
  };
}
