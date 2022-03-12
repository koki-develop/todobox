import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useEffect, useState } from "react";
import Loading from "@/components/utils/Loading";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Task } from "@/models/task";
import { listenTask, updateTask } from "@/lib/taskUtils";

export type TaskModalCardProps = {
  open: boolean;
  userId: string;
  projectId: string;
  taskId?: string;

  onUpdated(task: Task): void;
  onClose: () => void;
};

const TaskModalCard: React.VFC<TaskModalCardProps> = React.memo((props) => {
  const { open, userId, projectId, taskId, onUpdated, onClose } = props;

  const theme = useTheme();

  const [loadedTask, setLoadedTask] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState<string>("");

  const handleChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.currentTarget.value.replace(/\r?\n/g, ""));
    },
    []
  );

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

  useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task]);

  useEffect(() => {
    if (!task) return;
    if (task.title === title) return;
    const timeoutId = setTimeout(() => {
      const updatedTask = { ...task, title };
      updateTask(userId, updatedTask).then(() => {
        onUpdated(updatedTask);
      });
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, title]);

  return (
    <ModalCard open={open} onClose={onClose}>
      {!loadedTask && (
        <CardContent>
          <Loading />
        </CardContent>
      )}
      {loadedTask && !task && (
        <CardContent>タスクが見つかりませんでした</CardContent>
      )}
      {loadedTask && task && (
        <>
          <ModalCardHeader
            title={
              <TextField
                fullWidth
                multiline
                value={title}
                InputProps={{ sx: { ...theme.typography.h6 } }}
                onChange={handleChangeTitle}
              />
            }
          />
          <CardContent>TODO: description</CardContent>
        </>
      )}
    </ModalCard>
  );
});

TaskModalCard.displayName = "TaskModalCard";

export default TaskModalCard;
