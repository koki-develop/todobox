import { useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  completedTasksInitializedState,
  completedTasksState,
  incompletedTasksInitializedState,
  incompletedTasksState,
} from "@/atoms/taskAtom";

export const useTasks = () => {
  const incompletedTasksInitialized = useRecoilValue(
    incompletedTasksInitializedState
  );
  const [incompletedTasks, setIncompletedTasks] = useRecoilState(
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

  return {
    tasksInitialized,
    tasks,
    incompletedTasks,
    completedTasks,
  };
};
