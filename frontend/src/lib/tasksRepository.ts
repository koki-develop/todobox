import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  DocumentSnapshot,
  increment,
  onSnapshot,
  orderBy,
  Query,
  query,
  QuerySnapshot,
  Unsubscribe,
  updateDoc,
  where,
  WriteBatch,
  writeBatch,
} from "firebase/firestore";
import { ulid } from "ulid";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/models/task";
import { firestore } from "@/lib/firebase";

export class TasksRepository {
  // TODO: 消す
  public static writeBatch(): WriteBatch {
    return writeBatch(firestore);
  }

  // TODO: 消す
  public static async commitBatch(batch: WriteBatch): Promise<void> {
    await batch.commit();
  }

  /*
   * read
   */

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

  public static listenCount(
    userId: string,
    projectId: string,
    callback: (count: number) => void
  ): Unsubscribe {
    const ref = this._getCounterShardsRef(userId, projectId);
    return onSnapshot(ref, (snapshot) => {
      const count = snapshot.docs.reduce<number>((result, current) => {
        return result + current.data().count;
      }, 0);
      callback(count);
    });
  }

  /*
   * write
   */

  public static build(input: CreateTaskInput) {
    return { id: ulid(), completedAt: null, ...input };
  }

  public static createBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    task: Task
  ): void {
    const { id, ...data } = task;
    const ref = this._getTaskRef(userId, projectId, id);
    batch.set(ref, data);
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

  public static deleteBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string,
    taskId: string
  ): void {
    const ref = this._getTaskRef(userId, projectId, taskId);
    batch.delete(ref);
    this.decrementCounterBatch(batch, userId, projectId);
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

  public static initializeCounterBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string
  ): void {
    for (let i = 0; i < 10; i++) {
      const ref = this._getCounterShardRef(userId, projectId, i);
      batch.set(ref, { count: 0 });
    }
  }

  public static incrementCounterBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string
  ): void {
    const ref = this._getRandomCounterShardRef(userId, projectId);
    batch.update(ref, { count: increment(1) });
  }

  public static decrementCounterBatch(
    batch: WriteBatch,
    userId: string,
    projectId: string
  ): void {
    const ref = this._getRandomCounterShardRef(userId, projectId);
    batch.update(ref, { count: increment(-1) });
  }

  /*
   * private
   */

  private static _getCounterShardRef(
    userId: string,
    projectId: string,
    shardId: number
  ): DocumentReference {
    return doc(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "counters",
      "tasks",
      "shards",
      shardId.toString()
    );
  }

  private static _getCounterShardsRef(
    userId: string,
    projectId: string
  ): CollectionReference {
    return collection(
      firestore,
      "users",
      userId,
      "projects",
      projectId,
      "counters",
      "tasks",
      "shards"
    );
  }

  private static _getRandomCounterShardRef(
    userId: string,
    projectId: string
  ): DocumentReference {
    const shardId = Math.floor(Math.random() * 10);
    return this._getCounterShardRef(userId, projectId, shardId);
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
