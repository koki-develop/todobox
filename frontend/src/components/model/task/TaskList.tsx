import React, { useMemo } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Task } from "@/models/task";

export type TaskListProps = {
  sectionId: string | null;
  tasks: Task[];
};

const TaskList: React.VFC<TaskListProps> = React.memo((props) => {
  const { sectionId, tasks } = props;

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  return (
    <Droppable droppableId={droppableId} type="tasks">
      {(provided) => (
        <ul ref={provided.innerRef} {...provided.droppableProps}>
          {tasks
            .sort((a, b) => a.index - b.index)
            .map((task, i) => (
              <Draggable key={task.id} draggableId={task.id} index={i}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {task.title}
                  </li>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
