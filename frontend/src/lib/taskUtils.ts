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

  // 移動対象のタスクを取得
  const firstTask = tasksClone.find((task) => task.id === firstTaskId);
  if (!firstTask) return tasksClone;

  // 付随する移動対象のタスク一覧を取得
  const otherTasks: Task[] = otherTaskIds.reduce((result, current) => {
    const otherTask = tasksClone.find((task) => task.id === current);
    if (!otherTask) {
      return result;
    }
    return [...result, otherTask];
  }, [] as Task[]);

  // 全ての移動対象のタスクの順序を保持しておく
  const sortedMovingTasks = indexTasks(
    sections,
    sortTasks(sections, [firstTask, ...otherTasks]).map((task) => ({
      ...task,
      sectionId: toSectionId,
    }))
  );

  // 移動対象のタスクを移動する
  const movedTasks = moveTask(
    sections,
    tasksClone,
    firstTask.id,
    toSectionId,
    toIndex
  );

  // 付随する移動対象のタスクを一旦タスク一覧から省いて採番する
  const filteredTasks = movedTasks.filter(
    (task) => !otherTasks.some((otherTask) => otherTask.id === task.id)
  );
  const indexedFilteredTasks = indexTasks(sections, filteredTasks);

  // 移動後のタスクを取得
  const movedFirstTask = indexedFilteredTasks.find(
    (task) => task.id === firstTask.id
  );
  if (!movedFirstTask) {
    throw new Error();
  }

  // 移動後のタスクの直下に付随するタスク一覧を挿入
  const insertedTasks = insertTasksToTasks(
    sections,
    indexedFilteredTasks,
    otherTasks,
    toSectionId,
    movedFirstTask.index + 1
  );

  // 移動したタスクの index を最初の順序に更新
  return updateOrAddTasks(
    sections,
    insertedTasks,
    sortedMovingTasks.map((task) => ({
      ...task,
      index: task.index + movedFirstTask.index,
    }))
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
