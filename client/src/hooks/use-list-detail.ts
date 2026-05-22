import useSWR from 'swr';

import { apiListDetailToList, fetchListById } from '@/lib/api/lists';
import type { ApiEntitySummary } from '@/lib/api/types';
import { swrKeys } from '@/lib/swr/keys';
import type { Entity, List } from '@/types';

function entitiesFromApi(rows: ApiEntitySummary[]): Entity[] {
  return rows.map((e) => ({
    id: e.id,
    name: e.name,
    team: e.team,
    tags: e.tags,
    imageUrl: e.imageUrl,
  }));
}

type ListDetailData = {
  list: List;
  entities: Entity[];
};

async function fetchListDetail(listId: string): Promise<ListDetailData> {
  const detail = await fetchListById(listId);
  return {
    list: apiListDetailToList(detail),
    entities: entitiesFromApi(detail.entities),
  };
}

export function useListDetail(listId?: string) {
  const { data, error, isLoading, isValidating } = useSWR(
    listId ? swrKeys.list(listId) : null,
    () => fetchListDetail(listId!)
  );

  return {
    list: data?.list ?? null,
    entities: data?.entities ?? null,
    loadError:
      error instanceof Error ? error.message : error ? String(error) : null,
    isLoading: Boolean(listId) && (isLoading || (isValidating && !data)),
  };
}
