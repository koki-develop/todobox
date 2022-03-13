import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentReference,
  onSnapshot,
  orderBy,
  Query,
  query,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  WriteBatch,
  writeBatch,
} from "firebase/firestore";
import { ulid } from "ulid";
import { Section } from "@/models/section";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/models/task";
import { arrayMove, arrayMoveToArray } from "@/lib/arrayUtils";
import { firestore } from "@/lib/firebase";

/*
 * ヘルパー
 */

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

export const updateTaskState = (
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

export const updateTasksState = (
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

export const updateOrAddTasksState = (
  sections: Section[],
  prev: Task[],
  updatedOrAddedTasks: Task[]
): Task[] => {
  const [tasksToAdd, tasksToUpdate]: [Task[], Task[]] =
    updatedOrAddedTasks.reduce(
      (result, current) => {
        if (prev.some((task) => task.id === current.id)) {
          return [result[0], [...result[1], current]];
        } else {
          return [[...result[0], current], result[1]];
        }
      },
      [[], []] as [Task[], Task[]]
    );

  return sortTasks(sections, [
    ...updateTasksState(sections, prev, tasksToUpdate),
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

export const indexTasksState = (sections: Section[], prev: Task[]): Task[] => {
  type Group = {
    sectionId: string | null;
    completedTasks: Task[];
    incompletedTasks: Task[];
  };
  const groups: Group[] = prev.reduce((result, current) => {
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
  const indexedSectionTasks = indexTasksState(sections, sectionTasks);
  return updateOrAddTasksState(sections, tasksClone, indexedSectionTasks);
};

export const buildTask = (input: CreateTaskInput): Task => {
  return { id: ulid(), completedAt: null, ...input };
};

export const updateOrAddTaskState = (
  sections: Section[],
  prev: Task[],
  updatedOrAddedTask: Task
): Task[] => {
  if (prev.some((task) => task.id === updatedOrAddedTask.id)) {
    return sortTasks(
      sections,
      updateTaskState(sections, prev, updatedOrAddedTask)
    );
  } else {
    return sortTasks(sections, [...prev, updatedOrAddedTask]);
  }
};

export const completeTaskState = (
  sections: Section[],
  prev: Task[],
  taskId: string
): Task[] => {
  const completedTask = prev.find((task) => task.id === taskId);
  if (!completedTask) return sortTasks(sections, prev);
  return indexTasksState(
    sections,
    updateTaskState(sections, prev, {
      ...completedTask,
      completedAt: new Date(),
    })
  );
};

export const incompleteTaskState = (
  sections: Section[],
  prev: Task[],
  taskId: string
): Task[] => {
  const incompletedTask = prev.find((task) => task.id === taskId);
  if (!incompletedTask) return sortTasks(sections, prev);
  const incompletedTasks = prev.filter((task) => !task.completedAt);
  const index = (incompletedTasks.slice(-1)[0]?.index ?? -1) + 1;

  return indexTasksState(
    sections,
    updateTaskState(sections, prev, {
      ...incompletedTask,
      index,
      completedAt: null,
    })
  );
};

export const deleteTaskState = (
  sections: Section[],
  prev: Task[],
  taskId: string
): Task[] => {
  return indexTasksState(
    sections,
    prev.filter((task) => task.id !== taskId)
  );
};

export const deleteTasksState = (
  sections: Section[],
  prev: Task[],
  taskIds: string[]
): Task[] => {
  return indexTasksState(
    sections,
    prev.filter((task) => !taskIds.includes(task.id))
  );
};

export const moveTaskState = (
  sections: Section[],
  prev: Task[],
  taskId: string,
  toSectionId: string | null,
  toIndex: number
): Task[] => {
  const tasksClone = prev.concat();
  if (tasksClone.length === 0) return tasksClone;

  // 移動対象のタスクを取得
  const movingTask = tasksClone.find((task) => task.id === taskId);
  if (!movingTask) return tasksClone;

  // 移動元のセクションのタスク一覧を取得
  const fromSectionTasks = getTasksBySectionId(
    sections,
    prev,
    movingTask.sectionId
  );

  if (movingTask.sectionId === toSectionId) {
    // 同一セクション内の移動
    // タスクを移動して index を採番
    const updatedTasks = indexTasksState(
      sections,
      arrayMove(fromSectionTasks, movingTask.index, toIndex)
    );

    // タスクを更新
    return updateTasksState(sections, prev, updatedTasks);
  } else {
    // 異なるセクション間の移動
    // 移動先のタスク一覧を取得
    const toSectionTasks = getTasksBySectionId(sections, prev, toSectionId);

    // タスクを移動
    const [updatedFromSectionTasks, updatedToSectionTasks] = arrayMoveToArray(
      fromSectionTasks,
      toSectionTasks,
      movingTask.index,
      toIndex
    );

    // index を採番してタスクを更新
    const updatedTasks = [
      ...indexTasksState(sections, updatedFromSectionTasks),
      ...indexTasksState(
        sections,
        updatedToSectionTasks.map((task) => ({
          ...task,
          sectionId: toSectionId,
        }))
      ),
    ];
    return updateTasksState(sections, prev, updatedTasks);
  }
};

export const moveTasksState = (
  sections: Section[],
  prev: Task[],
  firstTaskId: string,
  otherTaskIds: string[],
  toSectionId: string | null,
  toIndex: number
): Task[] => {
  const tasksClone = prev.concat();

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
  const sortedMovingTasks = indexTasksState(
    sections,
    sortTasks(sections, [firstTask, ...otherTasks]).map((task) => ({
      ...task,
      sectionId: toSectionId,
    }))
  );

  // 移動対象のタスクを移動する
  const movedTasks = moveTaskState(
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
  const indexedFilteredTasks = indexTasksState(sections, filteredTasks);

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
  return updateTasksState(
    sections,
    insertedTasks,
    sortedMovingTasks.map((task) => ({
      ...task,
      index: task.index + movedFirstTask.index,
    }))
  );
};

/*
 * 読み取り
 */

export const listenTask = (
  userId: string,
  projectId: string,
  taskId: string,
  callback: (task: Task | null) => void
): Unsubscribe => {
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks",
    taskId
  );
  return onSnapshot(ref, async (snapshot) => {
    if (snapshot.exists()) {
      const task: Task = {
        id: snapshot.id,
        projectId,
        ...snapshot.data(),
      } as Task;
      callback(task);
    } else {
      callback(null);
    }
  });
};

export const listenIncompletedTasks = (
  userId: string,
  projectId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  const ref = collection(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks"
  );
  const q = query(ref, where("completedAt", "==", null), orderBy("index"));
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((doc) => {
      const { completedAt, ...data } = doc.data();
      return {
        id: doc.id,
        projectId,
        completedAt: completedAt?.toDate() ?? null,
        ...data,
      } as Task;
    });
    callback(tasks);
  });
};

export const listenCompletedTasks = (
  userId: string,
  projectId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  const ref = collection(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks"
  );
  const q = query(
    ref,
    where("completedAt", "!=", null),
    orderBy("completedAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((doc) => {
      const { completedAt, ...data } = doc.data();
      return {
        id: doc.id,
        projectId,
        completedAt: completedAt?.toDate() ?? null,
        ...data,
      } as Task;
    });
    callback(tasks);
  });
};

/*
 * 書き込み
 */

export const createTask = async (userId: string, task: Task): Promise<void> => {
  const { id: taskId, projectId, ...data } = task;
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks",
    taskId
  );
  await setDoc(ref, { ...data });
};

export const updateTask = async (userId: string, task: Task): Promise<void> => {
  const { id: taskId, projectId, ...data } = task;
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks",
    taskId
  );
  await updateDoc(ref, { ...data });
};

export const updateTasks = async (
  userId: string,
  tasks: Task[]
): Promise<void> => {
  const batch = writeBatch(firestore);
  updateTasksBatch(batch, userId, tasks);
  await batch.commit();
};

export const updateTasksBatch = (
  batch: WriteBatch,
  userId: string,
  tasks: Task[]
): void => {
  for (const task of tasks) {
    const { id, projectId, ...data } = task;
    const ref = doc(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "tasks",
      id
    );
    batch.update(ref, { ...data });
  }
};

export const deleteTask = async (
  userId: string,
  projectId: string,
  taskId: string
): Promise<void> => {
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks",
    taskId
  );
  await deleteDoc(ref);
};

export const deleteTaskBatch = (
  batch: WriteBatch,
  userId: string,
  projectId: string,
  taskId: string
): void => {
  const ref = doc(
    firestore,
    "users",
    userId,
    "projects",
    projectId,
    "tasks",
    taskId
  );
  batch.delete(ref);
};

export const deleteTasksBatch = (
  batch: WriteBatch,
  userId: string,
  projectId: string,
  taskIds: string[]
): void => {
  for (const taskId of taskIds) {
    deleteTaskBatch(batch, userId, projectId, taskId);
  }
};

export class TasksRepository {
  public static build(input: CreateTaskInput) {
    return { id: ulid(), completedAt: null, ...input };
  }

  public static async create(
    userId: string,
    projectId: string,
    task: Task
  ): Promise<void> {
    const { id, ...data } = task;
    const ref = this._getTaskRef(userId, projectId, id);
    await setDoc(ref, data);
  }

  public static writeBatch(): WriteBatch {
    return writeBatch(firestore);
  }

  public static async commitBatch(batch: WriteBatch): Promise<void> {
    await batch.commit();
  }

  public static async update(
    userId: string,
    projectId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<void> {
    const ref = this._getTaskRef(userId, projectId, taskId);
    await updateDoc(ref, { ...input });
  }

  public static async updateTasks(
    userId: string,
    projectId: string,
    inputs: { [id: string]: UpdateTaskInput }
  ): Promise<void> {
    const batch = this.writeBatch();
    this.updateTasksBatch(batch, userId, projectId, inputs);
    await this.commitBatch(batch);
  }

  public static updateTasksBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    inputs: { [id: string]: UpdateTaskInput }
  ): void {
    for (const [id, input] of Object.entries(inputs)) {
      const ref = this._getTaskRef(userId, projectId, id);
      batch.update(ref, { ...input });
    }
  }

  public static async deleteTasks(
    userId: string,
    projectId: string,
    taskIds: string[]
  ): Promise<void> {
    const batch = this.writeBatch();
    for (const taskId of taskIds) {
      this.deleteBatch(batch, userId, projectId, taskId);
    }
    await this.commitBatch(batch);
  }

  public static deleteBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    taskId: string
  ): void {
    const ref = this._getTaskRef(userId, projectId, taskId);
    batch.delete(ref);
  }

  public static listenIncompletedTasks(
    userId: string,
    projectId: string,
    callback: (tasks: Task[]) => void
  ): Unsubscribe {
    const q = this._getIncompletedTasksQuery(userId, projectId);
    return onSnapshot(q, (snapshot) => {
      const tasks = this._querySnapshotToTasks(snapshot);
      callback(tasks);
    });
  }

  public static listenCompletedTasks(
    userId: string,
    projectId: string,
    callback: (tasks: Task[]) => void
  ): Unsubscribe {
    const q = this._getCompletedTasksQuery(userId, projectId);
    return onSnapshot(q, (snapshot) => {
      const tasks = this._querySnapshotToTasks(snapshot);
      callback(tasks);
    });
  }

  private static _querySnapshotToTasks(snapshot: QuerySnapshot): Task[] {
    return snapshot.docs.map((doc) => {
      const { completedAt, ...data } = doc.data();
      return {
        id: doc.id,
        completedAt: completedAt?.toDate() ?? null,
        ...data,
      } as Task;
    });
  }

  private static _getTaskRef(
    userId: string,
    projectId: string,
    taskId: string
  ): DocumentReference {
    return doc(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "tasks",
      taskId
    );
  }

  private static _getTasksRef(
    userId: string,
    projectId: string
  ): CollectionReference {
    return collection(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "tasks"
    );
  }

  private static _getIncompletedTasksQuery(
    userId: string,
    projectId: string
  ): Query {
    const ref = this._getTasksRef(userId, projectId);
    return query(ref, where("completedAt", "==", null), orderBy("index"));
  }

  private static _getCompletedTasksQuery(
    userId: string,
    projectId: string
  ): Query {
    const ref = this._getTasksRef(userId, projectId);
    return query(
      ref,
      where("completedAt", "!=", null),
      orderBy("completedAt", "desc")
    );
  }
}

export class TasksStateHelper {
  public static create(prev: Task[], sections: Section[], task: Task): Task[] {
    return this._addOrUpdate(prev, sections, task);
  }

  public static update(prev: Task[], sections: Section[], task: Task): Task[] {
    return this._update(prev, sections, task);
  }

  public static move(
    prev: Task[],
    sections: Section[],
    taskId: string,
    toSectionId: string | null,
    toIndex: number
  ): Task[] {
    // 移動対象のタスクを取得
    const movingTask = prev.find((task) => task.id === taskId);
    if (!movingTask) return prev;

    // 移動元のセクションのタスク一覧を取得
    const fromSectionTasks = this._filterBySectionId(
      prev,
      movingTask.sectionId
    );

    if (movingTask.sectionId === toSectionId) {
      // 同一セクション内の移動
      // タスクを移動して index を採番
      const updatedTasks = this._index(
        arrayMove(fromSectionTasks, movingTask.index, toIndex),
        sections
      );

      // タスクを更新
      return this._updateTasks(prev, sections, updatedTasks);
    } else {
      // 異なるセクション間の移動
      // 移動先のタスク一覧を取得
      const toSectionTasks = this._filterBySectionId(prev, toSectionId);

      // タスクを移動
      const [updatedFromSectionTasks, updatedToSectionTasks] = arrayMoveToArray(
        fromSectionTasks,
        toSectionTasks,
        movingTask.index,
        toIndex
      );

      // index を採番してタスクを更新
      const updatedTasks = [
        ...this._index(updatedFromSectionTasks, sections),
        ...this._index(
          updatedToSectionTasks.map((task) => ({
            ...task,
            sectionId: toSectionId,
          })),
          sections
        ),
      ];
      return this._updateTasks(prev, sections, updatedTasks);
    }
  }

  public static moveTasks(
    prev: Task[],
    sections: Section[],
    firstTaskId: string,
    otherTaskIds: string[],
    toSectionId: string | null,
    toIndex: number
  ): Task[] {
    // FIXME: 後で直す
    return moveTasksState(
      sections,
      prev,
      firstTaskId,
      otherTaskIds,
      toSectionId,
      toIndex
    );
  }

  public static complete(
    prev: Task[],
    sections: Section[],
    taskId: string
  ): Task[] {
    const task = prev.find((task) => task.id === taskId);
    if (!task) return prev;
    return this._index(
      this._update(prev, sections, {
        ...task,
        completedAt: new Date(),
      }),
      sections
    );
  }

  public static incomplete(
    prev: Task[],
    sections: Section[],
    taskId: string
  ): Task[] {
    const task = prev.find((task) => task.id === taskId);
    if (!task) return prev;
    const incompletedTasks = prev.filter((task) => !task.completedAt);
    const index = (incompletedTasks.slice(-1)[0]?.index ?? -1) + 1;

    return this._index(
      this._update(prev, sections, {
        ...task,
        index,
        completedAt: null,
      }),
      sections
    );
  }

  public static delete(
    prev: Task[],
    sections: Section[],
    taskId: string
  ): Task[] {
    return this._index(
      prev.filter((prevTask) => prevTask.id !== taskId),
      sections
    );
  }

  public static deleteTasks(
    prev: Task[],
    sections: Section[],
    taskIds: string[]
  ): Task[] {
    return this._index(
      prev.filter((prevTask) => !taskIds.includes(prevTask.id)),
      sections
    );
  }

  public static separateTasks(prev: Task[]): {
    incompleted: Task[];
    completed: Task[];
  } {
    return prev.reduce(
      (result, current) => {
        if (current.completedAt) {
          return {
            incompleted: result.incompleted,
            completed: [...result.completed, current],
          };
        } else {
          return {
            incompleted: [...result.incompleted, current],
            completed: result.completed,
          };
        }
      },
      { incompleted: [], completed: [] } as {
        incompleted: Task[];
        completed: Task[];
      }
    );
  }

  private static _filterBySectionId(
    tasks: Task[],
    sectionId: string | null
  ): Task[] {
    return tasks.filter((task) => task.sectionId === sectionId);
  }

  private static _addOrUpdate(
    prev: Task[],
    sections: Section[],
    task: Task
  ): Task[] {
    if (prev.some((prevSection) => prevSection.id === task.id)) {
      return this._update(prev, sections, task);
    } else {
      return this._sort([...prev, task], sections);
    }
  }

  private static _update(
    prev: Task[],
    sections: Section[],
    task: Task
  ): Task[] {
    return this._sort(
      prev.map((prevSection) => {
        if (prevSection.id === task.id) {
          return task;
        } else {
          return prevSection;
        }
      }),
      sections
    );
  }

  private static _updateTasks(
    prev: Task[],
    sections: Section[],
    tasks: Task[]
  ): Task[] {
    return sortTasks(
      sections,
      prev.map((prevTask) => {
        const updatedTask = tasks.find(
          (updatedTask) => updatedTask.id === prevTask.id
        );
        return updatedTask ?? prevTask;
      })
    );
  }

  private static _sort(prev: Task[], sections: Section[]): Task[] {
    return prev.concat().sort((a, b) => {
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
  }

  private static _index(prev: Task[], sections: Section[]): Task[] {
    type Group = {
      sectionId: string | null;
      completedTasks: Task[];
      incompletedTasks: Task[];
    };
    const groups: Group[] = prev.reduce((result, current) => {
      const group = result.find(
        (group) => group.sectionId === current.sectionId
      );
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
  }

  private static _insertTasks = (
    prev: Task[],
    sections: Section[],
    tasksToInsert: Task[],
    sectionId: string | null,
    index: number
  ): Task[] => {
    // 挿入先のセクションのタスク一覧を取得
    const sectionTasks = this._filterBySectionId(prev, sectionId);

    // タスクを挿入して採番
    sectionTasks.splice(
      index,
      0,
      ...tasksToInsert.map((task) => ({ ...task, sectionId }))
    );
    const indexedSectionTasks = this._index(sectionTasks, sections);
    return this._updateTasks(prev, sections, indexedSectionTasks);
  };
}
