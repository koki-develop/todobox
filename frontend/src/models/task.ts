import { ulid } from "ulid";
import { dummySections } from "./section";

export const dummyTasks: Task[] = [
  { sectionId: null, id: ulid(), index: 0, title: "task 1", completedAt: null },
  { sectionId: null, id: ulid(), index: 1, title: "task 2", completedAt: null },
  {
    sectionId: dummySections[0].id,
    index: 0,
    id: ulid(),
    title: "task 3",
    completedAt: null,
  },
  {
    sectionId: dummySections[0].id,
    index: 1,
    id: ulid(),
    title: "task 4",
    completedAt: null,
  },
  {
    sectionId: dummySections[1].id,
    index: 0,
    id: ulid(),
    title: "task 5",
    completedAt: null,
  },
  {
    sectionId: dummySections[1].id,
    index: 1,
    id: ulid(),
    title: "task 6",
    completedAt: null,
  },
  {
    sectionId: dummySections[2].id,
    index: 0,
    id: ulid(),
    title: "task 7",
    completedAt: null,
  },
  {
    sectionId: dummySections[2].id,
    index: 1,
    id: ulid(),
    title: "task 8",
    completedAt: null,
  },
  {
    sectionId: dummySections[2].id,
    index: 2,
    id: ulid(),
    title: "task 9",
    completedAt: null,
  },
  {
    sectionId: dummySections[2].id,
    index: 3,
    id: ulid(),
    title: "task 10",
    completedAt: null,
  },
];

export type Task = {
  sectionId: string | null;

  id: string;
  index: number;
  title: string;

  completedAt: Date | null;
};
