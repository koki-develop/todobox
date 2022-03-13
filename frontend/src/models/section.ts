export type Section = {
  id: string;
  index: number;
  name: string;
};

export type CreateSectionInput = Omit<Section, "id">;

export type UpdateSectionInput = Partial<Omit<Section, "id" | "index">>;
