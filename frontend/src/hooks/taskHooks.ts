import { useCallback, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  completedTasksInitializedState,
  incompletedTasksInitializedState,
  tasksState,
} from "@/atoms/taskAtom";
import { CreateTaskInput } from "@/models/task";
import { UpdateTaskInput } from "@/models/task";
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
    tasksInitialized,
    tasks,
    incompletedTasks,
    completedTasks,
    createTask,
    completeTask,
    incompleteTask,
  };
};
