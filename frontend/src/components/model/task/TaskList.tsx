import Box from "@mui/material/Box";
import List from "@mui/material/List";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskListItem from "@/components/model/task/TaskListItem";
import { Task } from "@/models/task";
import { buildTask, separateTasks } from "@/lib/taskUtils";

export type TaskListProps = {
  projectId: string;
  sectionId: string | null;
  tasks: Task[];
  selectedTasks: Task[];

  onCompleteTask: (task: Task) => void;
  onIncompleteTask: (task: Task) => void;
  onCreateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const TaskList: React.VFC<TaskListProps> = React.memo((props) => {
  const {
    projectId,
    sectionId,
    tasks,
    selectedTasks,
    onCompleteTask,
    onIncompleteTask,
    onCreateTask,
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const [title, setTitle] = useState<string>("");

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  const [completedTasks, incompletedTasks] = useMemo(() => {
    return separateTasks(tasks);
  }, [tasks]);

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
    const index =
      incompletedTasks.length === 0
        ? 0
        : incompletedTasks.slice(-1)[0].index + 1;
    const task = buildTask({
      projectId,
      sectionId,
      title: trimmedTitle,
      index,
    });
    onCreateTask(task);
  }, [incompletedTasks, onCreateTask, projectId, sectionId, title]);

  // TODO: リファクタ
  return (
    <>
      <Droppable droppableId={droppableId} type="tasks">
        {(provided) => (
          <List
            ref={provided.innerRef}
            disablePadding
            sx={{ mb: 2 }}
            {...provided.droppableProps}
          >
            {incompletedTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                selectedTasks={selectedTasks}
                onComplete={onCompleteTask}
                onIncomplete={onIncompleteTask}
                onDelete={onDeleteTask}
                onClick={onClickTask}
                onSelect={onSelectTask}
                onMultiSelect={onMultiSelectTask}
              />
            ))}
            {/* <li>
            <input type="text" value={title} onChange={handleChangeTitle} />
            <button onClick={handleCreate}>create</button>
          </li> */}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
      <List disablePadding sx={{ mb: 2 }}>
        {completedTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            selectedTasks={selectedTasks}
            onComplete={onCompleteTask}
            onIncomplete={onIncompleteTask}
            onDelete={onDeleteTask}
            onClick={onClickTask}
            onSelect={onSelectTask}
            onMultiSelect={onMultiSelectTask}
          />
        ))}
      </List>
    </>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
