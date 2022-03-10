import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import React, { useCallback, useMemo } from "react";
import TaskListItemContainer, {
  TaskListItemContainerProps,
} from "@/components/model/task/TaskListItemContainer";
import { Task } from "@/models/task";

export type TaskListItemProps = Omit<
  TaskListItemContainerProps,
  "onClick" | "onSelect"
> & {
  task: Task;
  selectedTasks: Task[];

  onComplete: (task: Task) => void;
  onIncomplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onClick: (task: Task) => void;
  onSelect: (task: Task) => void;
  onMultiSelect: (task: Task) => void;
};

const TaskListItem: React.VFC<TaskListItemProps> = React.forwardRef(
  (props, ref) => {
    const {
      task,
      selectedTasks,
      onClick,
      onSelect,
      onMultiSelect,
      onComplete,
      onIncomplete,
      onDelete,
      ...taskListItemContainerProps
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

    const handleIncomplete = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onIncomplete(task);
      },
      [onIncomplete, task]
    );

    const handleComplete = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onComplete(task);
      },
      [onComplete, task]
    );

    const handleDelete = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onDelete(task);
      },
      [onDelete, task]
    );

    return (
      <TaskListItemContainer
        {...taskListItemContainerProps}
        ref={ref}
        sx={{
          ":hover": {
            "& .moreIconButton": {
              visibility: "visible",
            },
          },
        }}
      >
        <ListItemButton
          selected={selected}
          onClick={handleClick}
          sx={{
            pl: 1,
            border: "1px solid",
            borderColor: "divider",
            height: 38,
          }}
        >
          <IconButton
            size="small"
            onClick={task.completedAt ? handleIncomplete : handleComplete}
          >
            {task.completedAt ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : (
              <CheckCircleOutlineIcon fontSize="small" />
            )}
          </IconButton>
          <ListItemText primary={`[${task.index}] ${task.title}`} />
          <IconButton
            className="moreIconButton"
            size="small"
            sx={{ visibility: "hidden" }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
          {/* <button onClick={handleDelete}>delete</button> */}
        </ListItemButton>
      </TaskListItemContainer>
    );
  }
);

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
