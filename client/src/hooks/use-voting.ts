import { useMemo } from 'react';

import { MIN_SUBMIT_DRIVER_RATIO } from '@/lib/constants';
import { drivers } from '@/lib/mock/drivers';
import { f1List, votingLists } from '@/lib/mock/lists';
import { useVotingStore, type BoardDestination } from '@/store/voting-store';
import { TIER_VALUES, type Entity, type Vote } from '@/types';

const entityLookup = drivers.reduce<Record<string, Entity>>((acc, entity) => {
  acc[entity.id] = entity;
  return acc;
}, {});

export function useVoting(listId?: string) {
  const board = useVotingStore((state) => state.board);
  const moveEntity = useVotingStore((state) => state.moveEntity);
  const resetBoard = useVotingStore((state) => state.resetBoard);

  const list = useMemo(() => {
    if (!listId) {
      return f1List;
    }

    return votingLists.find((item) => item.id === listId) ?? f1List;
  }, [listId]);

  const tiers = useMemo(() => {
    return [...list.tiers].sort((a, b) => a.order - b.order);
  }, [list]);

  const assignedIds = useMemo(() => {
    return new Set(Object.values(board).flat());
  }, [board]);

  const pool = useMemo(() => {
    return drivers.filter((driver) => !assignedIds.has(driver.id));
  }, [assignedIds]);

  const selectedCount = useMemo(() => {
    return TIER_VALUES.reduce((count, tier) => count + board[tier].length, 0);
  }, [board]);

  const minimumRequiredCount = useMemo(() => {
    return Math.ceil(drivers.length * MIN_SUBMIT_DRIVER_RATIO);
  }, []);

  const hasVotes = selectedCount > 0;
  const canSubmit = selectedCount >= minimumRequiredCount;

  const buildVotePayload = (userId: string): Vote[] => {
    const createdAt = new Date().toISOString();

    return TIER_VALUES.flatMap((tier) => {
      return board[tier].map((entityId, index) => ({
        id: `${list.id}-${entityId}-${index}`,
        userId,
        listId: list.id,
        entityId,
        tier,
        createdAt,
      }));
    });
  };

  return {
    list,
    tiers,
    board,
    pool,
    entitiesById: entityLookup,
    selectedCount,
    totalCount: drivers.length,
    minimumRequiredCount,
    hasVotes,
    canSubmit,
    moveEntity: (entityId: string, toTier: BoardDestination) =>
      moveEntity(entityId, toTier),
    resetBoard,
    buildVotePayload,
  };
}
