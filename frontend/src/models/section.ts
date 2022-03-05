import { ulid } from "ulid";

export const dummySections: Section[] = [
  { projectId: "dummyprojectid", id: ulid(), index: 0, name: "section 1" },
  { projectId: "dummyprojectid", id: ulid(), index: 1, name: "section 2" },
  { projectId: "dummyprojectid", id: ulid(), index: 2, name: "section 3" },
];

export type Section = {
  projectId: string;

  id: string;
  index: number;
  name: string;
};

export type CreateSectionInput = Omit<Section, "id">;
