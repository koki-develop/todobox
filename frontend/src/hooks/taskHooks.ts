import { writeBatch } from "firebase/firestore";
import { useCallback, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  completedTasksInitializedState,
  incompletedTasksInitializedState,
  taskInitializedState,
  tasksState,
  taskState,
} from "@/atoms/taskAtom";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/models/task";
import { firestore } from "@/lib/firebase";
import { TasksRepository } from "@/lib/tasksRepository";
import { TasksStateHelper } from "@/lib/tasksStateHelper";
import { useSections } from "@/hooks/sectionsHooks";
import { useCurrentUser } from "@/hooks/userHooks";

// TODO: リファクタ
export const useTasks = () => {
  const { currentUser } = useCurrentUser();
  const { sections } = useSections();

  const [allTasks, setAllTasks] = useRecoilState(tasksState);
  const tasks = useMemo(() => {
    return [...allTasks.incompleted, ...allTasks.completed];
  }, [allTasks.completed, allTasks.incompleted]);
  const incompletedTasks = useMemo(() => {
    return allTasks.incompleted;
  }, [allTasks.incompleted]);
  const completedTasks = useMemo(() => {
    return allTasks.completed;
  }, [allTasks.completed]);

  const incompletedTasksInitialized = useRecoilValue(
    incompletedTasksInitializedState
  );
  const completedTasksInitialized = useRecoilValue(
    completedTasksInitializedState
  );

  const task = useRecoilValue(taskState);
  const taskInitialized = useRecoilValue(taskInitializedState);

  const tasksInitialized = useMemo(() => {
    return incompletedTasksInitialized && completedTasksInitialized;
  }, [completedTasksInitialized, incompletedTasksInitialized]);

  const createTask = useCallback(
    async (projectId: string, input: CreateTaskInput) => {
      if (!currentUser) return;
      const newTask = TasksRepository.build(input);
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.create(
          [...prev.incompleted, ...prev.completed],
          sections,
          newTask
        );
        return TasksStateHelper.separateTasks(allTasks);
      });
      const batch = writeBatch(firestore);
      TasksRepository.createBatch(batch, currentUser.uid, projectId, newTask);
      TasksRepository.incrementCounterBatch(batch, currentUser.uid, projectId);
      await batch.commit();
    },
    [currentUser, sections, setAllTasks]
  );

  const updateTask = useCallback(
    async (projectId: string, task: Task, input: UpdateTaskInput) => {
      if (!currentUser) return;
      const updatedTask = { ...task, ...input };
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.update(
          [...prev.incompleted, ...prev.completed],
          sections,
          updatedTask
        );
        return TasksStateHelper.separateTasks(allTasks);
      });
      await TasksRepository.update(currentUser.uid, projectId, task.id, input);
    },
    [currentUser, sections, setAllTasks]
  );

  const deleteTask = useCallback(
    async (
      projectId: string,
      taskId: string,
      options?: { disableDecrementCounter: boolean }
    ) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.delete(
          [...prev.incompleted, ...prev.completed],
          sections,
          taskId
        );

        const batch = writeBatch(firestore);
        const updateInputs = allTasks.reduce<{ [id: string]: UpdateTaskInput }>(
          (result, current) => {
            const { id, completedAt, index } = current;
            result[id] = { completedAt, index };
            return result;
          },
          {}
        );
        TasksRepository.updateTasksBatch(
          batch,
          currentUser.uid,
          projectId,
          updateInputs
        );
        TasksRepository.deleteBatch(batch, currentUser.uid, projectId, taskId);
        if (!options?.disableDecrementCounter) {
          TasksRepository.decrementCounterBatch(
            batch,
            currentUser.uid,
            projectId
          );
        }
        batch.commit();
        return TasksStateHelper.separateTasks(allTasks);
      });
    },
    [currentUser, sections, setAllTasks]
  );

  const deleteTasks = useCallback(
    async (projectId: string, taskIds: string[]) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.deleteTasks(
          [...prev.incompleted, ...prev.completed],
          sections,
          taskIds
        );
        const batch = writeBatch(firestore);
        TasksRepository.decrementCounterBatch(
          batch,
          currentUser.uid,
          projectId,
          taskIds.length
        );
        for (const taskId of taskIds) {
          TasksRepository.deleteBatch(
            batch,
            currentUser.uid,
            projectId,
            taskId
          );
        }
        batch.commit();
        return TasksStateHelper.separateTasks(allTasks);
      });
    },
    [currentUser, sections, setAllTasks]
  );

  const moveTask = useCallback(
    async (
      projectId: string,
      taskId: string,
      toSectionId: string | null,
      toIndex: number
    ) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.move(
          [...prev.incompleted, ...prev.completed],
          sections,
          taskId,
          toSectionId,
          toIndex
        );
        const updateInputs = allTasks.reduce<{ [id: string]: UpdateTaskInput }>(
          (result, current) => {
            const { id, index, sectionId } = current;
            result[id] = { index, sectionId };
            return result;
          },
          {}
        );
        TasksRepository.updateTasks(currentUser.uid, projectId, updateInputs);
        return TasksStateHelper.separateTasks(allTasks);
      });
    },
    [currentUser, sections, setAllTasks]
  );

  const moveTasks = useCallback(
    async (
      projectId: string,
      firstTaskId: string,
      otherTaskIds: string[],
      toSectionId: string | null,
      toIndex: number
    ) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.moveTasks(
          [...prev.incompleted, ...prev.completed],
          sections,
          firstTaskId,
          otherTaskIds,
          toSectionId,
          toIndex
        );
        const updateInputs = allTasks.reduce<{ [id: string]: UpdateTaskInput }>(
          (result, current) => {
            const { id, index, sectionId } = current;
            result[id] = { index, sectionId };
            return result;
          },
          {}
        );
        TasksRepository.updateTasks(currentUser.uid, projectId, updateInputs);
        return TasksStateHelper.separateTasks(allTasks);
      });
    },
    [currentUser, sections, setAllTasks]
  );

  const completeTask = useCallback(
    async (projectId: string, taskId: string) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.complete(
          [...prev.incompleted, ...prev.completed],
          sections,
          taskId
        );
        const updateInputs = allTasks.reduce<{ [id: string]: UpdateTaskInput }>(
          (result, current) => {
            const { id, completedAt, index } = current;
            result[id] = { completedAt, index };
            return result;
          },
          {}
        );
        const batch = writeBatch(firestore);
        TasksRepository.updateTasksBatch(
          batch,
          currentUser.uid,
          projectId,
          updateInputs
        );
        TasksRepository.decrementCounterBatch(
          batch,
          currentUser.uid,
          projectId
        );
        batch.commit();
        return TasksStateHelper.separateTasks(allTasks);
      });
    },
    [currentUser, sections, setAllTasks]
  );

  const incompleteTask = useCallback(
    async (projectId: string, taskId: string) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.incomplete(
          [...prev.incompleted, ...prev.completed],
          sections,
          taskId
        );
        const updateInputs = allTasks.reduce<{ [id: string]: UpdateTaskInput }>(
          (result, current) => {
            const { id, completedAt, index } = current;
            result[id] = { completedAt, index };
            return result;
          },
          {}
        );
        const batch = writeBatch(firestore);
        TasksRepository.updateTasksBatch(
          batch,
          currentUser.uid,
          projectId,
          updateInputs
        );
        TasksRepository.incrementCounterBatch(
          batch,
          currentUser.uid,
          projectId
        );
        batch.commit();
        return TasksStateHelper.separateTasks(allTasks);
      });
    },
    [currentUser, sections, setAllTasks]
  );

  return {
    taskInitialized,
    task,
    tasksInitialized,
    tasks,
    incompletedTasks,
    completedTasks,
    createTask,
    updateTask,
    deleteTask,
    deleteTasks,
    completeTask,
    incompleteTask,
    moveTask,
    moveTasks,
  };
};
