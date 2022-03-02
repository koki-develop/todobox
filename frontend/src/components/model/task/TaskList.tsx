import React, { useMemo } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskListItem from "@/components/model/task/TaskListItem";
import { Task } from "@/models/task";

export type TaskListProps = {
  sectionId: string | null;
  tasks: Task[];
  selectedTasks: Task[];

  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const TaskList: React.VFC<TaskListProps> = React.memo((props) => {
  const {
    sectionId,
    tasks,
    selectedTasks,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  return (
    <Droppable droppableId={droppableId} type="tasks">
      {(provided) => (
        <ul ref={provided.innerRef} {...provided.droppableProps}>
          {tasks
            .sort((a, b) => a.index - b.index)
            .map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                selectedTasks={selectedTasks}
                onClick={onClickTask}
                onSelect={onSelectTask}
                onMultiSelect={onMultiSelectTask}
              />
            ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
