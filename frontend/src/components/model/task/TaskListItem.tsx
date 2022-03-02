import React, { useCallback } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Task } from "@/models/task";

export type TaskListItemProps = {
  task: Task;

  onClick: (task: Task) => void;
};

const TaskListItem: React.VFC<TaskListItemProps> = React.memo((props) => {
  const { task, onClick } = props;

  const handleClick = useCallback(() => {
    onClick(task);
  }, [onClick, task]);

  return (
    <Draggable draggableId={task.id} index={task.index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
        >
          {task.index}: {task.title}
        </li>
      )}
    </Draggable>
  );
});

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
