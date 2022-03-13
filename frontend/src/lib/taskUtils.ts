import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  DocumentSnapshot,
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

  public static listen(
    userId: string,
    projectId: string,
    taskId: string,
    callback: (task: Task | null) => void
  ): Unsubscribe {
    const ref = this._getTaskRef(userId, projectId, taskId);
    return onSnapshot(ref, (snapshot) => {
      const task = this._documentSnapshotToTask(snapshot);
      callback(task);
    });
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

  private static _documentSnapshotToTask(
    snapshot: DocumentSnapshot
  ): Task | null {
    if (snapshot.exists()) {
      const { completedAt, ...data } = snapshot.data();
      return {
        id: snapshot.id,
        completedAt: completedAt?.toDate() ?? null,
        ...data,
      } as Task;
    } else {
      return null;
    }
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
    // 移動対象のタスクを取得
    const firstTask = prev.find((task) => task.id === firstTaskId);
    if (!firstTask) return prev;

    // 付随する移動対象のタスク一覧を取得
    const otherTasks: Task[] = otherTaskIds.reduce((result, current) => {
      const otherTask = prev.find((task) => task.id === current);
      if (!otherTask) {
        return result;
      }
      return [...result, otherTask];
    }, [] as Task[]);

    // 全ての移動対象のタスクの順序を保持しておく
    const sortedMovingTasks = this._index(
      this._sort([firstTask, ...otherTasks], sections).map((task) => ({
        ...task,
        sectionId: toSectionId,
      })),
      sections
    );

    // 移動対象のタスクを移動する
    const movedTasks = this.move(
      prev,
      sections,
      firstTask.id,
      toSectionId,
      toIndex
    );

    // 付随する移動対象のタスクを一旦タスク一覧から省いて採番する
    const filteredTasks = movedTasks.filter(
      (task) => !otherTasks.some((otherTask) => otherTask.id === task.id)
    );
    const indexedFilteredTasks = this._index(filteredTasks, sections);

    // 移動後のタスクを取得
    const movedFirstTask = indexedFilteredTasks.find(
      (task) => task.id === firstTask.id
    );
    if (!movedFirstTask) {
      throw new Error();
    }

    // 移動後のタスクの直下に付随するタスク一覧を挿入
    const insertedTasks = this._insertTasks(
      indexedFilteredTasks,
      sections,
      otherTasks,
      toSectionId,
      movedFirstTask.index + 1
    );

    // 移動したタスクの index を最初の順序に更新
    return this._updateTasks(
      insertedTasks,
      sections,
      sortedMovingTasks.map((task) => ({
        ...task,
        index: task.index + movedFirstTask.index,
      }))
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

  public static getTasksByRange(
    prev: Task[],
    sections: Section[],
    fromTaskId: string,
    toTaskId: string
  ) {
    const sortedTasks = this._sort(prev, sections);

    const index1 = sortedTasks.findIndex((task) => task.id === fromTaskId);
    if (index1 === -1) return [];
    const index2 = sortedTasks.findIndex((task) => task.id === toTaskId);
    if (index2 === -1) return [];

    return sortedTasks.slice(
      Math.min(index1, index2),
      Math.max(index1, index2) + 1
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

  private static _addOrUpdateTasks(
    prev: Task[],
    sections: Section[],
    tasks: Task[]
  ): Task[] {
    const [tasksToAdd, tasksToUpdate]: [Task[], Task[]] = tasks.reduce(
      (result, current) => {
        if (prev.some((task) => task.id === current.id)) {
          return [result[0], [...result[1], current]];
        } else {
          return [[...result[0], current], result[1]];
        }
      },
      [[], []] as [Task[], Task[]]
    );

    return this._sort(
      [...this._updateTasks(prev, sections, tasksToUpdate), ...tasksToAdd],
      sections
    );
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
    return this._sort(
      prev.map((prevTask) => {
        const updatedTask = tasks.find(
          (updatedTask) => updatedTask.id === prevTask.id
        );
        return updatedTask ?? prevTask;
      }),
      sections
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

    return this._sort(indexedTasks, sections);
  }

  private static _insertTasks = (
    prev: Task[],
    sections: Section[],
    tasksToInsert: Task[],
    sectionId: string | null,
    index: number
  ): Task[] => {
    const tasksClone = prev.concat();
    const tasksToInsertClone = tasksToInsert.concat();

    // 挿入先のセクションのタスク一覧を取得
    const sectionTasks = this._filterBySectionId(tasksClone, sectionId);

    // タスクを挿入して採番
    sectionTasks.splice(
      index,
      0,
      ...tasksToInsertClone.map((task) => ({ ...task, sectionId }))
    );
    const indexedSectionTasks = this._index(sectionTasks, sections);
    return this._addOrUpdateTasks(tasksClone, sections, indexedSectionTasks);
  };
}
