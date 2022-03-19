import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import React, { useCallback, useMemo, useState } from "react";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Task } from "@/models/task";
import { useTasks } from "@/hooks/taskHooks";

export type TaskDeleteConfirmModalProps = {
  open: boolean;
  projectId: string;
  task: Task;
  selectedTasks: Task[];

  onCancel: () => void;
  onDeleted: () => void;
};

const TaskDeleteConfirmModal: React.VFC<TaskDeleteConfirmModalProps> =
  React.memo((props) => {
    const { open, projectId, task, selectedTasks, onCancel, onDeleted } = props;

    const { deleteTask, deleteTasks } = useTasks();

    const [deleting, setDeleting] = useState<boolean>(false);

    const deleteOne = useMemo(() => {
      return (
        selectedTasks.length === 1 ||
        !selectedTasks.some((selectedTask) => selectedTask.id === task.id)
      );
    }, [selectedTasks, task.id]);

    const handleDelete = useCallback(() => {
      setDeleting(true);
      (async () => {
        if (deleteOne) {
          // 単一削除
          await deleteTask(projectId, task.id, {
            disableDecrementCounter: Boolean(task.completedAt),
          });
        } else {
          // 複数削除
          await deleteTasks(
            projectId,
            selectedTasks.map((task) => task.id)
          );
        }
      })()
        .then(() => {
          onDeleted();
        })
        .finally(() => {
          setDeleting(false);
        });
    }, [
      deleteOne,
      deleteTask,
      deleteTasks,
      onDeleted,
      projectId,
      selectedTasks,
      task.completedAt,
      task.id,
    ]);

    return (
      <ModalCard open={open} onClose={onCancel}>
        <ModalCardHeader
          title={
            deleteOne
              ? `タスク「${task.title}」を削除しますか？`
              : `タスク「${task.title}」を含む${selectedTasks.length}件のタスクを削除しますか？`
          }
        />
        <CardContent>この操作は取り消せません。</CardContent>
        <ModalCardActions>
          <Button onClick={onCancel}>キャンセル</Button>
          <LoadableButton
            variant="contained"
            color="error"
            loading={deleting}
            onClick={handleDelete}
          >
            削除
          </LoadableButton>
        </ModalCardActions>
      </ModalCard>
    );
  });

TaskDeleteConfirmModal.displayName = "TaskDeleteConfirmModal";

export default TaskDeleteConfirmModal;
