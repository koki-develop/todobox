import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import {
  completedTasksInitializedState,
  completedTasksState,
  incompletedTasksInitializedState,
  incompletedTasksState,
} from "@/atoms/taskAtom";
import { TasksRepository } from "@/lib/taskUtils";
import { useCurrentUser } from "@/hooks/userHooks";

export type TasksListenerProps = {
  projectId: string;
  withCompleted: boolean;
};

const TasksListener: React.VFC<TasksListenerProps> = React.memo((props) => {
  const { projectId, withCompleted } = props;

  const { currentUser } = useCurrentUser();

  const setIncompletedTasksInitialized = useSetRecoilState(
    incompletedTasksInitializedState
  );
  const setIncompletedTasks = useSetRecoilState(incompletedTasksState);
  const setCompletedTasksInitialized = useSetRecoilState(
    completedTasksInitializedState
  );
  const setCompletedTasks = useSetRecoilState(completedTasksState);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = TasksRepository.listenIncompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setIncompletedTasks(tasks);
        setIncompletedTasksInitialized(true);
      }
    );
    return () => {
      unsubscribe();
      setIncompletedTasksInitialized(false);
      setIncompletedTasks([]);
    };
  }, [
    currentUser,
    projectId,
    setIncompletedTasks,
    setIncompletedTasksInitialized,
  ]);

  useEffect(() => {
    if (!currentUser) return;
    if (!withCompleted) {
      setCompletedTasksInitialized(true);
      return;
    }
    const unsubscribe = TasksRepository.listenCompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setCompletedTasks(tasks);
        setCompletedTasksInitialized(true);
      }
    );
    return () => {
      unsubscribe();
      setCompletedTasksInitialized(false);
      setCompletedTasks([]);
    };
  }, [
    currentUser,
    projectId,
    setCompletedTasks,
    setCompletedTasksInitialized,
    withCompleted,
  ]);

  return null;
});

TasksListener.displayName = "TasksListener";

export default TasksListener;
