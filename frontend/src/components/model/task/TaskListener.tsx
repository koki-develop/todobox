import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { taskInitializedState, taskState } from "@/atoms/taskAtom";
import { TasksRepository } from "@/lib/taskUtils";
import { useCurrentUser } from "@/hooks/userHooks";

export type TaskListenerProps = {
  projectId: string;
  taskId: string;
};

const TaskListener: React.VFC<TaskListenerProps> = React.memo((props) => {
  const { projectId, taskId } = props;
  const { currentUser } = useCurrentUser();

  const setTaskInitialized = useSetRecoilState(taskInitializedState);
  const setTask = useSetRecoilState(taskState);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = TasksRepository.listen(
      currentUser.uid,
      projectId,
      taskId,
      (task) => {
        setTask(task);
        setTaskInitialized(true);
      }
    );
    return () => {
      unsubscribe();
      setTaskInitialized(false);
      setTask(null);
    };
  }, [currentUser, projectId, setTask, setTaskInitialized, taskId]);

  return null;
});

TaskListener.displayName = "TaskListener";

export default TaskListener;
