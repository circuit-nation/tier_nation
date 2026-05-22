/** Response shapes from GET /lists and GET /lists/:id */

export type ApiTierConfigEntry = {
  value: number;
  label: string;
};

export type ApiTiersConfig = {
  tiers: ApiTierConfigEntry[];
};

export type ApiUserStatusCompact = {
  hasSubmitted: boolean;
  canViewCommunityResults: boolean;
};

export type ApiUserStatus = ApiUserStatusCompact & {
  submissionId: string | null;
  submittedAt: string | null;
  isAnonymous: boolean;
  voteCount: number;
  userAverageScore: number | null;
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
  entityCount?: number;
  status?: 'upcoming' | 'live' | 'ended' | 'locked' | 'archived';
  isLive?: boolean;
  votingOpen?: boolean;
  votingClosedReason?: string | null;
  userStatus?: ApiUserStatus | ApiUserStatusCompact;
};

export type ApiEntitySummary = {
  id: string;
  name: string;
  description?: string;
  team: string;
  tags: string[];
  imageUrl?: string;
  sortOrder?: number;
};

export type ApiListDetail = ApiListSummary & {
  entities: ApiEntitySummary[];
  userStatus?: ApiUserStatus;
};

export type ApiListsResponse = {
  lists: ApiListSummary[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ApiSubmission = {
  id: string;
  listId: string;
  userId: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  existed?: boolean;
  hasSubmitted?: boolean;
  voteCount?: number;
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

export type ApiPostVotesResponse = {
  submissionId: string;
  voteCount: number;
  updatedAt: string;
  userAverageScore: number;
};

export type ApiEntityAverageRow = {
  entityId: string;
  averageTierValue: number;
  voteCount: number;
  entityName?: string;
  team?: string;
  imageUrl?: string;
  averageTierLabel?: string;
  rank?: number;
};

export type ApiEntityAveragesResponse = {
  entityAverages: ApiEntityAverageRow[];
  uniqueVoters: number;
};

export type ApiAverageScoreResponse = {
  listId: string;
  averageScore: number;
  participantCount: number;
  userAverageScore: number | null;
};

export type ApiListStats = {
  listId: string;
  entityCount: number;
  uniqueVoters: number;
  totalSubmissions: number;
  totalVoteLines: number;
};

export type ApiVotesMeResponse = {
  listId: string;
  submissionId: string;
  isAnonymous: boolean;
  submittedAt: string;
  voteCount: number;
  votes: ApiVoteLine[];
  userAverageScore: number;
};

export type ApiMySubmission = {
  listId: string;
  listName: string;
  coverImage: string;
  submissionId: string;
  submittedAt: string;
  voteCount: number;
  isAnonymous: boolean;
  userAverageScore: number;
};

export type ApiMySubmissionsResponse = {
  submissions: ApiMySubmission[];
};

export type ApiMeResponse = {
  user: {
    id: string;
    google_id?: string;
    email: string;
    name: string;
    avatar_url: string;
    created_at?: string;
    updated_at?: string;
  };
  submissionsCount: number;
};

export type ApiErrorBody = {
  error?: string;
  code?: string;
};
