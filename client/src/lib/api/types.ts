/** Response shapes from GET /lists and GET /lists/:id */

export type ApiTierConfigEntry = {
  value: number;
  label: string;
};

export type ApiTiersConfig = {
  tiers: ApiTierConfigEntry[];
};

export type ApiListSummary = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  tiersConfig: ApiTiersConfig;
  isLocked: boolean;
  isVisible: boolean;
  startTime?: string | null;
  endTime?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiEntitySummary = {
  id: string;
  name: string;
  team: string;
  tags: string[];
  imageUrl?: string;
};

export type ApiListDetail = ApiListSummary & {
  entities: ApiEntitySummary[];
};

export type ApiSubmission = {
  id: string;
  listId: string;
  userId: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiVoteLine = {
  entityId: string;
  tierValue: number;
  placementOrder?: number;
};

export type ApiPostVotesBody = {
  listId: string;
  isAnonymous: boolean;
  votes: ApiVoteLine[];
};

export type ApiEntityAverageRow = {
  entityId: string;
  averageTierValue: number;
  voteCount: number;
};
