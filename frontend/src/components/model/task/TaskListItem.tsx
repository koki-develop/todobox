import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useRef, useState } from "react";
import TaskListItemContainer, {
  TaskListItemContainerProps,
} from "@/components/model/task/TaskListItemContainer";
import PopperList from "@/components/utils/PopperList";
import PopperListItem from "@/components/utils/PopperListItem";
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

    const theme = useTheme();

    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    const [openMenu, setOpenMenu] = useState<boolean>(false);

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

    const handleOpenMenu = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setOpenMenu(true);
      },
      []
    );

    const handleCloseMenu = useCallback(() => {
      setOpenMenu(false);
    }, []);

    const handleDelete = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onDelete(task);
      },
      [onDelete, task]
    );
    console.log(JSON.stringify(theme.palette.action, null, 4));

    return (
      <TaskListItemContainer
        {...taskListItemContainerProps}
        ref={ref}
        sx={{
          [theme.breakpoints.up("sm")]: {
            ":hover": {
              "& .moreIconButton": {
                visibility: "visible",
              },
            },
          },
        }}
      >
        <ListItemButton
          selected={selected}
          onClick={handleClick}
          sx={{
            backgroundColor: openMenu ? theme.palette.action.hover : undefined,
            border: "1px solid",
            borderColor: "divider",
            height: 38,
            pl: 1,
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
            ref={menuButtonRef}
            className="moreIconButton"
            size="small"
            sx={{ visibility: "hidden" }}
            onClick={handleOpenMenu}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </ListItemButton>
        <PopperList
          anchorEl={menuButtonRef.current}
          open={openMenu}
          onClose={handleCloseMenu}
          clickAwayListenerProps={{ mouseEvent: "onMouseDown" }}
        >
          <PopperListItem
            onClick={handleDelete}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="タスクを削除" />
          </PopperListItem>
        </PopperList>
      </TaskListItemContainer>
    );
  }
);

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
