import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import React, { useCallback, useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskListItemContainer from "@/components/model/task/TaskListItemContainer";
import { Task } from "@/models/task";

export type TaskListItemProps = {
  task: Task;
  selectedTasks: Task[];

  onComplete: (task: Task) => void;
  onIncomplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onClick: (task: Task) => void;
  onSelect: (task: Task) => void;
  onMultiSelect: (task: Task) => void;
};

const TaskListItem: React.VFC<TaskListItemProps> = React.memo((props) => {
  const {
    task,
    selectedTasks,
    onClick,
    onSelect,
    onMultiSelect,
    onComplete,
    onIncomplete,
    onDelete,
  } = props;

  const selected = useMemo(() => {
    return selectedTasks.some((selectedTask) => selectedTask.id === task.id);
  }, [selectedTasks, task.id]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.shiftKey) {
        onMultiSelect(task);
        return;
      }
      if (e.metaKey || e.ctrlKey) {
        onSelect(task);
        return;
      }
      onClick(task);
    },
    [onClick, onMultiSelect, onSelect, task]
  );

  const handleIncomplete = useCallback(() => {
    onIncomplete(task);
  }, [onIncomplete, task]);

  const handleComplete = useCallback(() => {
    onComplete(task);
  }, [onComplete, task]);

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDelete(task);
    },
    [onDelete, task]
  );

  // TODO: リファクタ
  return task.completedAt ? (
    <TaskListItemContainer>
      <ListItemButton
        selected={selected}
        onClick={handleClick}
        sx={{ height: "100%" }}
      >
        {task.completedAt ? (
          <IconButton size="small" onClick={handleIncomplete}>
            <CheckCircleIcon fontSize="small" color="success" />
          </IconButton>
        ) : (
          <IconButton size="small" onClick={handleComplete}>
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <ListItemText primary={`[${task.index}] ${task.title}`} />
        <button onClick={handleDelete}>delete</button>
      </ListItemButton>
    </TaskListItemContainer>
  ) : (
    <Draggable
      isDragDisabled={Boolean(task.completedAt)}
      draggableId={task.id}
      index={task.index}
    >
      {(provided) => (
        <TaskListItemContainer
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItemButton
            selected={selected}
            onClick={handleClick}
            sx={{ height: "100%" }}
          >
            {task.completedAt ? (
              <IconButton size="small" onClick={handleIncomplete}>
                <CheckCircleIcon fontSize="small" color="success" />
              </IconButton>
            ) : (
              <IconButton size="small" onClick={handleComplete}>
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            )}
            <ListItemText primary={`[${task.index}] ${task.title}`} />
            <button onClick={handleDelete}>delete</button>
          </ListItemButton>
        </TaskListItemContainer>
      )}
    </Draggable>
  );
});

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
