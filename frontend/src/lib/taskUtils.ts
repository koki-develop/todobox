import { Section } from "@/models/section";
import { Task } from "@/models/task";
import { arrayMove, arrayMoveToArray } from "@/lib/arrayUtils";

// TODO: 全体的に汚すぎるのでリファクタする

export const sortTasks = (sections: Section[], tasks: Task[]): Task[] => {
  const tasksClone = tasks.concat();

  return tasksClone.sort((a, b) => {
    if (a.sectionId === b.sectionId) {
      return a.index - b.index;
    } else {
      const aSection = sections.find((section) => section.id === a.sectionId);
      if (!aSection) return -1;
      const bSection = sections.find((section) => section.id === b.sectionId);
      if (!bSection) return 1;
      return aSection.index - bSection.index;
    }
  });
};

export const updateOrAddTasks = (
  sections: Section[],
  tasks: Task[],
  updatedOrAddedTasks: Task[]
): Task[] => {
  const tasksToAdd = updatedOrAddedTasks.filter(
    (updatedTask) => !tasks.some((task) => task.id === updatedTask.id)
  );

  return sortTasks(sections, [
    ...tasks.map((task) => {
      const updatedTask = updatedOrAddedTasks.find(
        (updatedTask) => updatedTask.id === task.id
      );
      return updatedTask ?? task;
    }),
    ...tasksToAdd,
  ]);
};

export const getTasksByRange = (
  sections: Section[],
  tasks: Task[],
  fromTaskId: string,
  toTaskId: string
) => {
  const sortedTasks = sortTasks(sections, tasks);

  const index1 = sortedTasks.findIndex((task) => task.id === fromTaskId);
  if (index1 === -1) return [];
  const index2 = sortedTasks.findIndex((task) => task.id === toTaskId);
  if (index2 === -1) return [];

  return sortedTasks.slice(
    Math.min(index1, index2),
    Math.max(index1, index2) + 1
  );
};

export const getTasksBySectionId = (
  sections: Section[],
  tasks: Task[],
  sectionId: string | null
): Task[] => {
  return sortTasks(
    sections,
    tasks.filter((task) => task.sectionId === sectionId)
  );
};

export const indexTasks = (sections: Section[], tasks: Task[]): Task[] => {
  type Group = { sectionId: string | null; tasks: Task[] };
  const groups: Group[] = tasks.reduce((result, current) => {
    const group = result.find((group) => group.sectionId === current.sectionId);
    if (!group) {
      return [...result, { sectionId: current.sectionId, tasks: [current] }];
    } else {
      group.tasks.push(current);
      return result;
    }
  }, [] as Group[]);

  const indexedTasks: Task[] = groups.reduce((result, current) => {
    return [
      ...result,
      ...current.tasks.map((task, i) => ({ ...task, index: i })),
    ];
  }, [] as Task[]);

  return sortTasks(sections, indexedTasks);
};

export const moveTask = (
  sections: Section[],
  tasks: Task[],
  taskId: string,
  toSectionId: string | null,
  toIndex: number
): Task[] => {
  const tasksClone = tasks.concat();
  if (tasksClone.length === 0) return tasksClone;

  // 移動対象のタスクを取得
  const movingTask = tasksClone.find((task) => task.id === taskId);
  if (!movingTask) return tasksClone;

  // 移動元のセクションのタスク一覧を取得
  const fromSectionTasks = getTasksBySectionId(
    sections,
    tasks,
    movingTask.sectionId
  );

  if (movingTask.sectionId === toSectionId) {
    // 同一セクション内の移動
    // タスクを移動して index を採番
    const updatedTasks = indexTasks(
      sections,
      arrayMove(fromSectionTasks, movingTask.index, toIndex)
    );

    // タスクを更新
    return updateOrAddTasks(sections, tasks, updatedTasks);
  } else {
    // 異なるセクション間の移動
    // 移動先のタスク一覧を取得
    const toSectionTasks = getTasksBySectionId(sections, tasks, toSectionId);

    // タスクを移動
    const [updatedFromSectionTasks, updatedToSectionTasks] = arrayMoveToArray(
      fromSectionTasks,
      toSectionTasks,
      movingTask.index,
      toIndex
    );

    // index を採番してタスクを更新
    const updatedTasks = [
      ...indexTasks(sections, updatedFromSectionTasks),
      ...indexTasks(
        sections,
        updatedToSectionTasks.map((task) => ({
          ...task,
          sectionId: toSectionId,
        }))
      ),
    ];
    return updateOrAddTasks(sections, tasks, updatedTasks);
  }
};

export const moveTasks = (
  sections: Section[],
  tasks: Task[],
  firstTaskId: string,
  otherTaskIds: string[],
  toSectionId: string | null,
  toIndex: number
): Task[] => {
  const tasksClone = tasks.concat();

  const firstTask = tasks.find((task) => task.id === firstTaskId);
  if (!firstTask) return tasksClone;

  const otherTasks: Task[] = otherTaskIds.map(
    (otherTaskId) => tasks.find((task) => task.id === otherTaskId)!
  );
  if (otherTasks.some((otherTask) => !otherTask)) return tasksClone;

  const sortedMovedTasks = sortTasks(sections, [firstTask, ...otherTasks]).map(
    (task, i) => ({ ...task, sectionId: null, index: i })
  );

  const movedTasks = moveTask(
    sections,
    tasks,
    firstTask.id,
    toSectionId,
    toIndex
  );
  const filteredTasks = movedTasks.filter(
    (task) => !otherTasks.some((otherTask) => otherTask.id === task.id)
  );
  let currentIndex = 0;
  let currentSectionId: string | null = null;
  const indexedFilteredTasks = filteredTasks.map((filteredTask) => {
    if (filteredTask.sectionId !== currentSectionId) {
      currentIndex = 0;
      currentSectionId = filteredTask.sectionId;
    }
    const next = { ...filteredTask, index: currentIndex };
    currentIndex++;
    return next;
  });
  const movedFirstTask = indexedFilteredTasks.find(
    (task) => task.id === firstTask.id
  )!;

  const result = insertTasksToTasks(
    sections,
    indexedFilteredTasks,
    otherTasks,
    toSectionId,
    movedFirstTask.index + 1
  );

  return sortTasks(
    sections,
    result.map((task) => {
      const sorted = sortedMovedTasks.find(
        (sortedTask) => sortedTask.id === task.id
      );
      if (!sorted) {
        return task;
      }
      return { ...task, index: sorted.index + movedFirstTask.index };
    })
  );
};

export const insertTasksToTasks = (
  sections: Section[],
  tasks: Task[],
  tasksToInsert: Task[],
  sectionId: string | null,
  index: number
): Task[] => {
  const tasksClone = tasks.concat();
  const tasksToInsertClone = tasksToInsert.concat();

  // 挿入先のセクションのタスク一覧を取得
  const sectionTasks = getTasksBySectionId(sections, tasksClone, sectionId);

  // タスクを挿入して採番
  sectionTasks.splice(
    index,
    0,
    ...tasksToInsertClone.map((task) => ({ ...task, sectionId }))
  );
  const indexedSectionTasks = indexTasks(sections, sectionTasks);
  return updateOrAddTasks(sections, tasksClone, indexedSectionTasks);
};
