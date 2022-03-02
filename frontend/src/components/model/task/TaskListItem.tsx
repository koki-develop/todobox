import React, { useCallback, useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Task } from "@/models/task";

export type TaskListItemProps = {
  task: Task;
  selectedTasks: Task[];

  onClick: (task: Task) => void;
  onSelect: (task: Task) => void;
  onMultiSelect: (task: Task) => void;
};

const TaskListItem: React.VFC<TaskListItemProps> = React.memo((props) => {
  const { task, selectedTasks, onClick, onSelect, onMultiSelect } = props;

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

  return (
    <Draggable draggableId={task.id} index={task.index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
        >
          <span style={{ fontWeight: selected ? "bold" : undefined }}>
            {task.index}: {task.title}
          </span>
        </li>
      )}
    </Draggable>
  );
});

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
