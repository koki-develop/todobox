import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskDraggableListItem from "@/components/model/task/TaskDraggableListItem";
import TaskListItem from "@/components/model/task/TaskListItem";
import TaskListItemContainer from "@/components/model/task/TaskListItemContainer";
import TaskNewListItem from "@/components/model/task/TaskNewListItem";
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

  const theme = useTheme();

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
    (title: string, cont: boolean) => {
      if (!cont) {
        setInputtingTask(false);
      }
      const index =
        incompletedTasks.length === 0
          ? 0
          : incompletedTasks.slice(-1)[0].index + 1;
      const task = buildTask({
        projectId,
        sectionId,
        title,
        index,
      });
      onCreateTask(task);
    },
    [incompletedTasks, onCreateTask, projectId, sectionId]
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
              <TaskListItemContainer>
                <ListItemButton
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: 38,
                    color: theme.palette.text.secondary,
                    ":hover": {
                      backgroundColor: snapshot.isDraggingOver
                        ? theme.palette.background.paper
                        : undefined,
                    },
                  }}
                  onClick={handleStartCreateTask}
                >
                  <ListItemText secondary="タスクを追加" />
                </ListItemButton>
              </TaskListItemContainer>
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
