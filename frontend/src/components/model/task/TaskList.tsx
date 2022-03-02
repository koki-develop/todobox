import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { ulid } from "ulid";
import TaskListItem from "@/components/model/task/TaskListItem";
import { Task } from "@/models/task";

export type TaskListProps = {
  sectionId: string | null;
  tasks: Task[];
  selectedTasks: Task[];

  onCreateTask: (task: Task) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const TaskList: React.VFC<TaskListProps> = React.memo((props) => {
  const {
    sectionId,
    tasks,
    selectedTasks,
    onCreateTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const [title, setTitle] = useState<string>("");

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  const handleChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.currentTarget.value);
    },
    []
  );

  const handleCreate = useCallback(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") return;
    setTitle("");
    const index = tasks.length === 0 ? 0 : tasks.slice(-1)[0].index + 1;
    onCreateTask({
      id: ulid(),
      sectionId,
      title: trimmedTitle,
      index,
    });
  }, [onCreateTask, sectionId, tasks, title]);

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
          <li>
            <input type="text" value={title} onChange={handleChangeTitle} />
            <button onClick={handleCreate}>create</button>
          </li>
        </ul>
      )}
    </Droppable>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
