import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskDraggableListItem from "@/components/model/task/TaskDraggableListItem";
import TaskListItem from "@/components/model/task/TaskListItem";
import TaskNewListItem from "@/components/model/task/TaskNewListItem";
import { Task } from "@/models/task";
import { separateTasks } from "@/lib/taskUtils";
import { useTasks } from "@/hooks/taskHooks";

export type TaskListProps = {
  projectId: string;
  sectionId: string | null;
  tasks: Task[];
  selectedTasks: Task[];

  onCompleteTask: (task: Task) => void;
  onIncompleteTask: (task: Task) => void;
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
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const theme = useTheme();

  const { createTask } = useTasks();

  const [inputtingTask, setInputtingTask] = useState<boolean>(false);

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  const [completedTasks, incompletedTasks] = useMemo(() => {
    return separateTasks(tasks);
  }, [tasks]);

  const handleStartCreateTask = useCallback(() => {
    setInputtingTask(true);
  }, []);

  const handleCancelCreateTask = useCallback(() => {
    setInputtingTask(false);
  }, []);

  const handleCreateTask = useCallback(
    async (title: string, cont: boolean) => {
      if (!cont) {
        setInputtingTask(false);
      }
      const index =
        incompletedTasks.length === 0
          ? 0
          : incompletedTasks.slice(-1)[0].index + 1;

      await createTask(projectId, { sectionId, title, index });
    },
    [createTask, incompletedTasks, projectId, sectionId]
  );

  // TODO: リファクタ
  return (
    <>
      <Droppable droppableId={droppableId} type="tasks">
        {(provided, snapshot) => (
          <List
            ref={provided.innerRef}
            disablePadding
            sx={{ mb: 2 }}
            {...provided.droppableProps}
          >
            {incompletedTasks.map((task) => (
              <TaskDraggableListItem
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
            {provided.placeholder}
            {inputtingTask ? (
              <TaskNewListItem
                onCreate={handleCreateTask}
                onCancel={handleCancelCreateTask}
              />
            ) : (
              <Button
                fullWidth
                startIcon={<AddIcon />}
                size="small"
                sx={{
                  height: 37,
                  justifyContent: "flex-start",
                  pl: 2,
                  ":hover": {
                    backgroundColor: snapshot.isDraggingOver
                      ? theme.palette.background.paper
                      : undefined,
                  },
                }}
                onClick={handleStartCreateTask}
              >
                タスクを追加
              </Button>
            )}
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
