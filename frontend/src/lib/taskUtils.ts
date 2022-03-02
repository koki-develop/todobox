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

export const moveTask = (
  sections: Section[],
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
    return sortTasks(sections, nextTasks);
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
    const sorted = sortTasks(sections, nextTasks);
    return sorted;
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

  return result.map((task) => {
    const sorted = sortedMovedTasks.find(
      (sortedTask) => sortedTask.id === task.id
    );
    if (!sorted) {
      return task;
    }
    return { ...task, index: sorted.index + movedFirstTask.index };
  });
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

  return sortTasks(sections, result);
};
