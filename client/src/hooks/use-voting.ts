import { useMemo } from 'react';

import { useListDetail } from '@/hooks/use-list-detail';
import { tierLetterToApiValue } from '@/lib/tier-mapping';
import { MIN_SUBMIT_DRIVER_RATIO } from '@/lib/constants';
import { useVotingStore, type BoardDestination } from '@/store/voting-store';
import {
  TIER_VALUES,
  type Entity,
  type List,
  type PoolEntity,
  type Vote,
  type TierValue,
} from '@/types';

export function useVoting(listId?: string) {
  const board = useVotingStore((state) => state.board);
  const moveEntity = useVotingStore((state) => state.moveEntity);
  const resetBoard = useVotingStore((state) => state.resetBoard);

  const {
    list: remoteList,
    entities: remoteEntities,
    loadError,
    isLoading,
  } = useListDetail(listId);

  const list = remoteList as List | null;

  const entitySource = useMemo(() => {
    if (!remoteEntities?.length) return [];
    return [...remoteEntities].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }, [remoteEntities]);

  const entitiesById = useMemo(() => {
    return entitySource.reduce<Record<string, Entity>>((acc, entity) => {
      acc[entity.id] = entity;
      return acc;
    }, {});
  }, [entitySource]);

  const tiers = useMemo(() => {
    if (!list) return [];
    return [...list.tiers].sort((a, b) => a.order - b.order);
  }, [list]);

  const assignedIds = useMemo(() => {
    return new Set(Object.values(board).flat());
  }, [board]);

  const pool = useMemo<PoolEntity[]>(() => {
    return entitySource.map((driver) => ({
      ...driver,
      placed: assignedIds.has(driver.id),
    }));
  }, [entitySource, assignedIds]);

  const selectedCount = useMemo(() => {
    return TIER_VALUES.reduce((count, tier) => count + board[tier].length, 0);
  }, [board]);

  const minimumRequiredCount = useMemo(() => {
    return Math.ceil(entitySource.length * MIN_SUBMIT_DRIVER_RATIO);
  }, [entitySource.length]);

  const hasVotes = selectedCount > 0;
  const canSubmit = selectedCount >= minimumRequiredCount;

  const buildVotePayload = (userId: string): Vote[] => {
    if (!list) return [];
    const createdAt = new Date().toISOString();

    return TIER_VALUES.flatMap((tier) =>
      board[tier].map((entityId, index) => ({
        id: `${list.id}-${entityId}-${index}`,
        userId,
        listId: list.id,
        entityId,
        tier,
        createdAt,
      }))
    );
  };

  const buildApiVoteLines = () => {
    if (!list?.tiersConfig) {
      throw new Error('List tier configuration is missing');
    }
    return TIER_VALUES.flatMap((tier: TierValue) =>
      board[tier].map((entityId, index) => ({
        entityId,
        tierValue: tierLetterToApiValue(list.tiersConfig!, tier),
        placementOrder: index,
      }))
    );
  };

  return {
    list,
    tiers,
    board,
    pool,
    entitiesById,
    selectedCount,
    totalCount: entitySource.length,
    minimumRequiredCount,
    hasVotes,
    canSubmit,
    moveEntity: (entityId: string, toTier: BoardDestination) =>
      moveEntity(entityId, toTier),
    resetBoard,
    buildVotePayload,
    buildApiVoteLines,
    loadError,
    isLoadingList: Boolean(listId) && (isLoading || !remoteList),
  };
}
