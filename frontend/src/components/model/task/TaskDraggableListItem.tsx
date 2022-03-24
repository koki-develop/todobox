import React from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskListItem, {
  TaskListItemProps,
} from "@/components/model/task/TaskListItem";

export type TaskDraggableListItemProps = TaskListItemProps;

const TaskDraggableListItem: React.VFC<TaskDraggableListItemProps> = React.memo(
  (props) => {
    const { ...taskListItemProps } = props;

    return (
      <Draggable
        draggableId={taskListItemProps.task.id}
        index={taskListItemProps.task.index}
      >
        {(provided, snapshot) => (
          <TaskListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            {...taskListItemProps}
            dragging={snapshot.isDragging}
          />
        )}
      </Draggable>
    );
  }
);

TaskDraggableListItem.displayName = "TaskDraggableListItem";

export default TaskDraggableListItem;
