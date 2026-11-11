export interface PageResponse<T> {
  meta: {
    totalRecords: number;
    page?: number;
    limit?: number;
  };
  data: T[];
}

export interface Land {
  id: string;
  name: string;
  surface: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLand = Pick<Land, 'name' | 'surface' | 'unit'>;
export type UpdateLand = Partial<CreateLand>;

export interface Block extends Land {
  landId: string;
}

export type CreateBlock = Pick<Block, 'name' | 'surface' | 'unit' | 'landId'>;
export type UpdateBlock = Partial<CreateBlock>;

export interface Plantation {
  id: string;
  fruit: string;
  variety: string;
  surface: number;
  unit: string;
  blockId: string;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePlantation = Pick<
  Plantation,
  'fruit' | 'variety' | 'surface' | 'unit' | 'blockId' | 'startDate' | 'endDate'
>;

export type UpdatePlantation = Partial<CreatePlantation>;

export interface Harvester {
  id: string;
  rut: number;
  dv: string;
  name: string;
  lastname: string;
  contrator?: string | null;
  localStorePhoneId: number;
  phoneId: string;
  photo?: string | null;
  isLoaded: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateHarvester = Omit<Harvester, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateHarvester = Partial<CreateHarvester>;

export interface Tray {
  id: string;
  tag: string;
  description: string;
  weight: number;
  weightPerTray: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateTray = Pick<Tray, 'tag' | 'description' | 'weight' | 'weightPerTray'>;

export type UpdateTray = Partial<CreateTray>;

export interface Take {
  id: string;
  trayId: string;
  plantationId?: string | null;
  harvesterId: string;
  userId?: string;
  numberOfTray: number;
  brute: number;
  neto: number;
  price: number;
  phoneTakeId?: number | null;
  phoneId: string;
  isLoaded: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateTake = Omit<Take, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTake = Partial<CreateTake>;
