import { Section } from "@/models/section";
import { Task } from "@/models/task";
import { arrayMove, arrayMoveToArray } from "@/lib/arrayUtils";

/** タスク一覧を並び替える */
export const sortTasks = (sections: Section[], tasks: Task[]): Task[] => {
  const tasksClone = tasks.concat();

  return tasksClone.sort((a, b) => {
    if (a.sectionId === b.sectionId) {
      if (a.completedAt && b.completedAt) {
        return b.completedAt.getTime() - a.completedAt.getTime();
      }
      if (a.completedAt) return 1;
      if (b.completedAt) return -1;
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

/** 単一のタスクを完了する */
export const completeTask = (
  sections: Section[],
  tasks: Task[],
  taskId: string
): Task[] => {
  const completedTask = tasks.find((task) => task.id === taskId);
  if (!completedTask) return sortTasks(sections, tasks);
  return indexTasks(
    sections,
    updateTasks(sections, tasks, [
      { ...completedTask, completedAt: new Date() },
    ])
  );
};

/** 単一のタスクを未完了にする */
export const incompleteTask = (
  sections: Section[],
  tasks: Task[],
  taskId: string
): Task[] => {
  const incompletedTask = tasks.find((task) => task.id === taskId);
  if (!incompletedTask) {
    return sortTasks(sections, tasks);
  }

  const [, incompletedTasks] = separateTasks(tasks);
  const index = (incompletedTasks.slice(-1)[0]?.index ?? -1) + 1;

  return indexTasks(
    sections,
    updateTasks(sections, tasks, [
      { ...incompletedTask, index, completedAt: null },
    ])
  );
};

/** タスク一覧を完了済のタスク一覧と未完了のタスク一覧に分ける */
export const separateTasks = (tasks: Task[]): [Task[], Task[]] => {
  return tasks.reduce(
    (result, current) => {
      if (current.completedAt) {
        return [[...result[0], current], result[1]];
      } else {
        return [result[0], [...result[1], current]];
      }
    },
    [[], []] as [Task[], Task[]]
  );
};

/** 単一のタスクを更新する */
export const updateTask = (
  sections: Section[],
  tasks: Task[],
  updatedTask: Task
): Task[] => {
  return sortTasks(
    sections,
    tasks.map((task) => {
      if (task.id === updatedTask.id) {
        return updatedTask;
      } else {
        return task;
      }
    })
  );
};

/** 複数のタスクを更新する */
export const updateTasks = (
  sections: Section[],
  tasks: Task[],
  updatedTasks: Task[]
): Task[] => {
  return sortTasks(
    sections,
    tasks.map((task) => {
      const updatedTask = updatedTasks.find(
        (updatedTask) => updatedTask.id === task.id
      );
      return updatedTask ?? task;
    })
  );
};

/** 単一のタスクを更新する。タスク一覧に存在しない場合は追加する。 */
export const updateOrAddTask = (
  sections: Section[],
  tasks: Task[],
  updatedOrAddedTask: Task
): Task[] => {
  if (tasks.some((task) => task.id === updatedOrAddedTask.id)) {
    return sortTasks(sections, updateTask(sections, tasks, updatedOrAddedTask));
  } else {
    return sortTasks(sections, [...tasks, updatedOrAddedTask]);
  }
};

/** 複数のタスクを更新する。タスク一覧に存在しない場合は追加する。 */
export const updateOrAddTasks = (
  sections: Section[],
  tasks: Task[],
  updatedOrAddedTasks: Task[]
): Task[] => {
  const [tasksToAdd, tasksToUpdate]: [Task[], Task[]] =
    updatedOrAddedTasks.reduce(
      (result, current) => {
        if (tasks.some((task) => task.id === current.id)) {
          return [result[0], [...result[1], current]];
        } else {
          return [[...result[0], current], result[1]];
        }
      },
      [[], []] as [Task[], Task[]]
    );

  return sortTasks(sections, [
    ...updateTasks(sections, tasks, tasksToUpdate),
    ...tasksToAdd,
  ]);
};

/** タスク一覧から範囲を指定して複数のタスクを取得する */
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

/** タスク一覧からセクション ID を指定して複数のタスクを取得する */
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

/** タスク一覧から index を採番しなおしたタスク一覧を返す */
export const indexTasks = (sections: Section[], tasks: Task[]): Task[] => {
  type Group = {
    sectionId: string | null;
    completedTasks: Task[];
    incompletedTasks: Task[];
  };
  const groups: Group[] = tasks.reduce((result, current) => {
    const group = result.find((group) => group.sectionId === current.sectionId);
    if (!group) {
      if (current.completedAt) {
        return [
          ...result,
          {
            sectionId: current.sectionId,
            completedTasks: [{ ...current, index: -1 }],
            incompletedTasks: [],
          },
        ];
      } else {
        return [
          ...result,
          {
            sectionId: current.sectionId,
            completedTasks: [],
            incompletedTasks: [current],
          },
        ];
      }
    } else {
      if (current.completedAt) {
        group.completedTasks.push({ ...current, index: -1 });
      } else {
        group.incompletedTasks.push(current);
      }
      return result;
    }
  }, [] as Group[]);

  const indexedTasks: Task[] = groups.reduce((result, current) => {
    return [
      ...result,
      ...current.completedTasks,
      ...current.incompletedTasks.map((task, i) => ({ ...task, index: i })),
    ];
  }, [] as Task[]);

  return sortTasks(sections, indexedTasks);
};

/** 単一のタスクを移動する */
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
    return updateTasks(sections, tasks, updatedTasks);
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
    return updateTasks(sections, tasks, updatedTasks);
  }
};

/** 複数のタスクを移動する */
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
  return updateTasks(
    sections,
    insertedTasks,
    sortedMovingTasks.map((task) => ({
      ...task,
      index: task.index + movedFirstTask.index,
    }))
  );
};

/** タスク一覧の特定の位置に複数のタスクを挿入する */
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

/** 単一のタスクを削除する */
export const removeTask = (
  sections: Section[],
  tasks: Task[],
  taskId: string
): Task[] => {
  return sortTasks(
    sections,
    indexTasks(
      sections,
      tasks.filter((task) => task.id !== taskId)
    )
  );
};

/** 複数のタスクを削除する */
export const removeTasks = (
  sections: Section[],
  tasks: Task[],
  taskIds: string[]
): Task[] => {
  return sortTasks(
    sections,
    indexTasks(
      sections,
      tasks.filter((task) => !taskIds.includes(task.id))
    )
  );
};
