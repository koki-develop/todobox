import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useEffect, useState } from "react";
import TaskListener from "@/components/model/task/TaskListener";
import Loading from "@/components/utils/Loading";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { useTasks } from "@/hooks/taskHooks";

export type TaskModalCardProps = {
  open: boolean;
  projectId: string;
  taskId: string;

  onClose: () => void;
};

const TaskModalCard: React.VFC<TaskModalCardProps> = React.memo((props) => {
  const { open, projectId, taskId, onClose } = props;

  const theme = useTheme();

  const { task, taskInitialized, updateTask } = useTasks();

  const [title, setTitle] = useState<string>("");

  const handleChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.currentTarget.value.replace(/\r?\n/g, ""));
    },
    []
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task]);

  useEffect(() => {
    if (!task) return;
    if (task.title === title) return;
    const timeoutId = setTimeout(async () => {
      await updateTask(projectId, task, { title });
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, title]);

  return (
    <>
      <TaskListener projectId={projectId} taskId={taskId} />
      <ModalCard open={open} onClose={onClose}>
        {!taskInitialized && (
          <CardContent>
            <Loading />
          </CardContent>
        )}
        {taskInitialized && !task && (
          <CardContent>タスクが見つかりませんでした</CardContent>
        )}
        {taskInitialized && task && (
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
    </>
  );
});

TaskModalCard.displayName = "TaskModalCard";

export default TaskModalCard;
