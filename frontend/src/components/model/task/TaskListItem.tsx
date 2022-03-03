import React, { useCallback, useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
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

  const handleChangeCompleted = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.checked) {
        onComplete(task);
      } else {
        onIncomplete(task);
      }
    },
    [onComplete, onIncomplete, task]
  );

  const handleDelete = useCallback(() => {
    onDelete(task);
  }, [onDelete, task]);

  return (
    <Draggable draggableId={task.id} index={task.index}>
      {(provided) => (
        <li ref={provided.innerRef} {...provided.draggableProps}>
          <span {...provided.dragHandleProps}>handle</span>
          <input
            type="checkbox"
            checked={Boolean(task.completedAt)}
            onChange={handleChangeCompleted}
          />
          <span>[{task.index}]</span>
          <span
            style={{ fontWeight: selected ? "bold" : undefined }}
            onClick={handleClick}
          >
            {task.title}
          </span>
          <button onClick={handleDelete}>delete</button>
        </li>
      )}
    </Draggable>
  );
});

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
