import { Task } from "@/models/task";
import { arrayMove, arrayMoveToArray } from "@/lib/arrayUtils";

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
