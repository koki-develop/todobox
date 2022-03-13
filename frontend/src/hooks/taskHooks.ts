import { useCallback, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  completedTasksInitializedState,
  completedTasksState,
  incompletedTasksInitializedState,
  incompletedTasksState,
} from "@/atoms/taskAtom";
import { CreateTaskInput } from "@/models/task";
import { TasksRepository, TasksStateHelper } from "@/lib/taskUtils";
import { useSections } from "@/hooks/sectionHooks";
import { useCurrentUser } from "@/hooks/userHooks";

export const useTasks = () => {
  const { currentUser } = useCurrentUser();
  const { sections } = useSections();

  const incompletedTasksInitialized = useRecoilValue(
    incompletedTasksInitializedState
  );
  const [incompletedTasks, setIncompleteTasks] = useRecoilState(
    incompletedTasksState
  );

  const completedTasksInitialized = useRecoilValue(
    completedTasksInitializedState
  );
  const [completedTasks, setCompletedTasks] =
    useRecoilState(completedTasksState);

  const tasksInitialized = useMemo(() => {
    return incompletedTasksInitialized && completedTasksInitialized;
  }, [completedTasksInitialized, incompletedTasksInitialized]);

  const tasks = useMemo(() => {
    return [...incompletedTasks, ...completedTasks];
  }, [completedTasks, incompletedTasks]);

  const createTask = useCallback(
    async (projectId: string, input: CreateTaskInput) => {
      if (!currentUser) return;
      const newTask = TasksRepository.build(input);
      setIncompleteTasks((prev) => {
        return TasksStateHelper.create(prev, sections, newTask);
      });
      await TasksRepository.create(currentUser.uid, projectId, newTask);
    },
    [currentUser, sections, setIncompleteTasks]
  );

  return {
    tasksInitialized,
    tasks,
    incompletedTasks,
    completedTasks,
    createTask,
  };
};
