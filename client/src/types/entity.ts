export type Entity = {
  id: string;
  name: string;
  imageUrl?: string;
  team?: string;
  tags?: string[];
  description?: string;
  sortOrder?: number;
};

export interface PoolEntity extends Entity {
  placed: boolean;
}
