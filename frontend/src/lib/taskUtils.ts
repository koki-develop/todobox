import { Task } from "@/models/task";
import { arrayMove, arrayMoveToArray } from "@/lib/arrayUtils";

// TODO: 全体的に汚すぎるのでリファクタする

export const sortTasks = (tasks: Task[]): Task[] => {
  const tasksClone = tasks.concat();

  return tasksClone.sort((a, b) => {
    if (a.sectionId === b.sectionId) {
      return a.index - b.index;
    } else {
      if (a.sectionId == null) return -1;
      if (b.sectionId == null) return 1;
      return a.sectionId > b.sectionId ? 1 : -1;
    }
  });
};

export const moveTask = (
  tasks: Task[],
  taskId: string,
  toSectionId: string | null,
  toIndex: number
): Task[] => {
  const tasksClone = tasks.concat();
  if (tasksClone.length === 0) return tasksClone;

  const task = tasksClone.find((task) => task.id === taskId);
  if (!task) return tasksClone;

  const fromSectionTasks = tasks.filter(
    (fromTask) => fromTask.sectionId === task.sectionId
  );

  if (task.sectionId === toSectionId) {
    // 同一セクション内の移動
    const nextFromSectionTasks = arrayMove(
      fromSectionTasks,
      task.index,
      toIndex
    ).map((task, i) => ({ ...task, index: i }));

    const nextTasks = tasks.map((task) => {
      const nextTask = nextFromSectionTasks.find(
        (nextTask) => nextTask.id === task.id
      );
      return nextTask ?? task;
    });
    return sortTasks(nextTasks);
  } else {
    // 異なるセクション間の移動
    const toSectionTasks = tasks.filter(
      (task) => task.sectionId === toSectionId
    );
    const [nextFromSectionTasks, nextToSectionTasks] = arrayMoveToArray(
      fromSectionTasks,
      toSectionTasks,
      task.index,
      toIndex
    );
    const mergedNextTasks = [
      ...nextFromSectionTasks.map((task, i) => ({ ...task, index: i })),
      ...nextToSectionTasks.map((task, i) => ({
        ...task,
        sectionId: toSectionId,
        index: i,
      })),
    ];
    const nextTasks = tasks.map((task) => {
      const nextTask = mergedNextTasks.find(
        (nextTask) => nextTask.id === task.id
      );
      return nextTask ?? task;
    });
    const sorted = sortTasks(nextTasks);
    return sorted;
  }
};

export const moveTasks = (
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

  const movedTasks = moveTask(tasks, firstTask.id, toSectionId, toIndex);
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
  );

  return insertTasksToTasks(
    indexedFilteredTasks,
    otherTasks,
    toSectionId,
    (movedFirstTask?.index ?? 0) + 1
  );
};

export const insertTasksToTasks = (
  tasks: Task[],
  tasksToInsert: Task[],
  sectionId: string | null,
  index: number
): Task[] => {
  const tasksClone = tasks.concat();
  const tasksToInsertClone = tasksToInsert.concat();

  const sectionTasks = tasksClone.filter(
    (task) => task.sectionId === sectionId
  );
  sectionTasks.splice(index, 0, ...tasksToInsertClone);

  const indexedSectionTasks = sectionTasks.map((nextTask, i) => ({
    ...nextTask,
    sectionId,
    index: i,
  }));

  const result = tasks.map((task) => {
    const nextTaskIndex = indexedSectionTasks.findIndex(
      (indexedTask) => indexedTask.id === task.id
    );
    if (nextTaskIndex !== -1) {
      const nextTask = indexedSectionTasks[nextTaskIndex];
      indexedSectionTasks.splice(nextTaskIndex, 1);
      return nextTask;
    }
    return task;
  });
  result.splice(0, 0, ...indexedSectionTasks);

  return sortTasks(result);
};
