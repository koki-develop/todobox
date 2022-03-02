import React, { useCallback, useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Task } from "@/models/task";

export type TaskListItemProps = {
  task: Task;
  selectedTasks: Task[];

  onDelete: (task: Task) => void;
  onClick: (task: Task) => void;
  onSelect: (task: Task) => void;
  onMultiSelect: (task: Task) => void;
};

const TaskListItem: React.VFC<TaskListItemProps> = React.memo((props) => {
  const { task, selectedTasks, onClick, onSelect, onMultiSelect, onDelete } =
    props;

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

  const handleDelete = useCallback(() => {
    onDelete(task);
  }, [onDelete, task]);

  return (
    <Draggable draggableId={task.id} index={task.index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={handleClick}
        >
          <span {...provided.dragHandleProps}>handle</span>
          <span style={{ fontWeight: selected ? "bold" : undefined }}>
            {task.index}: {task.title}
          </span>
          <button onClick={handleDelete}>delete</button>
        </li>
      )}
    </Draggable>
  );
});

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
