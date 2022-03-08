import CardContent from "@mui/material/CardContent";
import React from "react";
import ModalCard from "@/components/utils/ModalCard";

export type TaskModalCardProps = {
  open: boolean;
  projectId: string;
  taskId?: string;

  onClose: () => void;
};

const TaskModalCard: React.VFC<TaskModalCardProps> = React.memo((props) => {
  const { open, onClose, projectId, taskId } = props;

  return (
    <ModalCard open={open} onClose={onClose}>
      <CardContent>{taskId}</CardContent>
    </ModalCard>
  );
});

TaskModalCard.displayName = "TaskModalCard";

export default TaskModalCard;
