export type Entity = {
  id: string;
  name: string;
  imageUrl?: string;
  team?: string;
  tags?: string[];
};

export interface PoolEntity extends Entity {
  placed: boolean;
}
