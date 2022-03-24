import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import {
  completedTasksInitializedState,
  incompletedTasksInitializedState,
  tasksState,
} from "@/atoms/taskAtom";
import { TasksRepository } from "@/lib/tasksRepository";
import { useCurrentUser } from "@/hooks/userHooks";

export type TasksListenerProps = {
  projectId: string;
  withCompleted: boolean;
};

const TasksListener: React.VFC<TasksListenerProps> = React.memo((props) => {
  const { projectId, withCompleted } = props;

  const { currentUser } = useCurrentUser();
  const setTasks = useSetRecoilState(tasksState);

  const setIncompletedTasksInitialized = useSetRecoilState(
    incompletedTasksInitializedState
  );
  const setCompletedTasksInitialized = useSetRecoilState(
    completedTasksInitializedState
  );

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = TasksRepository.listenIncompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setTasks((prev) => ({ ...prev, incompleted: tasks }));
        setIncompletedTasksInitialized(true);
      }
    );
    return () => {
      unsubscribe();
      setIncompletedTasksInitialized(false);
      setTasks((prev) => ({ ...prev, incompleted: [] }));
    };
  }, [currentUser, projectId, setIncompletedTasksInitialized, setTasks]);

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
        setTasks((prev) => ({ ...prev, completed: tasks }));
        setCompletedTasksInitialized(true);
      }
    );
    return () => {
      unsubscribe();
      setCompletedTasksInitialized(false);
      setTasks((prev) => ({ ...prev, completed: [] }));
    };
  }, [
    currentUser,
    projectId,
    setCompletedTasksInitialized,
    setTasks,
    withCompleted,
  ]);

  return null;
});

TasksListener.displayName = "TasksListener";

export default TasksListener;
