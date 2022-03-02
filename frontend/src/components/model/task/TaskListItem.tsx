import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Task } from "@/models/task";

export type TaskListItemProps = {
  task: Task;
};

const TaskListItem: React.VFC<TaskListItemProps> = React.memo((props) => {
  const { task } = props;

  return (
    <Draggable draggableId={task.id} index={task.index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {task.index}: {task.title}
        </li>
      )}
    </Draggable>
  );
});

TaskListItem.displayName = "TaskListItem";

export default TaskListItem;
