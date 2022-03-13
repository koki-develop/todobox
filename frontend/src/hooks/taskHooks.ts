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
import { TasksRepository, TasksStateHelper } from "@/lib/taskUtils";
import { useSections } from "@/hooks/sectionHooks";
import { useCurrentUser } from "@/hooks/userHooks";

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
      await TasksRepository.create(currentUser.uid, projectId, newTask);
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
    async (projectId: string, taskId: string) => {
      if (!currentUser) return;
      setAllTasks((prev) => {
        const allTasks = TasksStateHelper.delete(
          [...prev.incompleted, ...prev.completed],
          sections,
          taskId
        );
        const batch = TasksRepository.writeBatch();
        const updateInputs = allTasks.reduce((result, current) => {
          const { id, completedAt, index } = current;
          result[id] = { completedAt, index };
          return result;
        }, {} as { [id: string]: UpdateTaskInput });
        TasksRepository.updateTasksBatch(
          batch,
          currentUser.uid,
          projectId,
          updateInputs
        );
        TasksRepository.deleteBatch(batch, currentUser.uid, projectId, taskId);
        TasksRepository.commitBatch(batch);
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
        const updateInputs = allTasks.reduce((result, current) => {
          const { id, index, sectionId } = current;
          result[id] = { index, sectionId };
          return result;
        }, {} as { [id: string]: UpdateTaskInput });
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
        const updateInputs = allTasks.reduce((result, current) => {
          const { id, index, sectionId } = current;
          result[id] = { index, sectionId };
          return result;
        }, {} as { [id: string]: UpdateTaskInput });
        TasksRepository.updateTasks(currentUser.uid, projectId, updateInputs);
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
        TasksRepository.deleteTasks(currentUser.uid, projectId, taskIds);
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
        const updateInputs = allTasks.reduce((result, current) => {
          const { id, completedAt, index } = current;
          result[id] = { completedAt, index };
          return result;
        }, {} as { [id: string]: UpdateTaskInput });
        TasksRepository.updateTasks(currentUser.uid, projectId, updateInputs);
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
        const updateInputs = allTasks.reduce((result, current) => {
          const { id, completedAt, index } = current;
          result[id] = { completedAt, index };
          return result;
        }, {} as { [id: string]: UpdateTaskInput });
        TasksRepository.updateTasks(currentUser.uid, projectId, updateInputs);
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
