import CardContent from "@mui/material/CardContent";
import React, { useEffect, useState } from "react";
import ModalCard from "@/components/utils/ModalCard";
import { Task } from "@/models/task";
import { listenTask } from "@/lib/taskUtils";

export type TaskModalCardProps = {
  open: boolean;
  userId: string;
  projectId: string;
  taskId?: string;

  onClose: () => void;
};

const TaskModalCard: React.VFC<TaskModalCardProps> = React.memo((props) => {
  const { open, userId, projectId, taskId, onClose } = props;

  const [loadedTask, setLoadedTask] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!taskId) return;
    setLoadedTask(false);
    const unsubscribe = listenTask(userId, projectId, taskId, (task) => {
      setTask(task);
      setLoadedTask(true);
    });
    return unsubscribe;
  }, [open, projectId, taskId, userId]);

  return (
    <ModalCard open={open} onClose={onClose}>
      <CardContent>
        {!loadedTask && "loading..."}
        {loadedTask && !task && "not found"}
        {loadedTask && task && task.title}
      </CardContent>
    </ModalCard>
  );
});

TaskModalCard.displayName = "TaskModalCard";

export default TaskModalCard;
