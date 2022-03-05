export type Section = {
  projectId: string;

  id: string;
  index: number;
  name: string;
};

export type CreateSectionInput = Omit<Section, "id">;
