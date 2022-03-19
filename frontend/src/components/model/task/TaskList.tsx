import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import TaskDeleteConfirmModal from "@/components/model/task/TaskDeleteConfirmModal";
import TaskDraggableListItem from "@/components/model/task/TaskDraggableListItem";
import TaskListItem from "@/components/model/task/TaskListItem";
import TaskNewListItem from "@/components/model/task/TaskNewListItem";
import { Task } from "@/models/task";
import { TasksStateHelper } from "@/lib/tasksStateHelper";
import { useTasks } from "@/hooks/taskHooks";

export type TaskListProps = {
  projectId: string;
  sectionId: string | null;
  selectedTasks: Task[];
  showCompletedTasks: boolean;

  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const TaskList: React.VFC<TaskListProps> = React.memo((props) => {
  const {
    projectId,
    sectionId,
    selectedTasks,
    showCompletedTasks,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const theme = useTheme();

  const {
    completedTasks,
    incompletedTasks,
    createTask,
    completeTask,
    incompleteTask,
  } = useTasks();

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [inputtingTask, setInputtingTask] = useState<boolean>(false);

  const droppableId = useMemo(() => {
    return sectionId == null ? "none" : sectionId;
  }, [sectionId]);

  const sectionCompletedTasks = useMemo(() => {
    return TasksStateHelper.filterBySectionId(completedTasks, sectionId);
  }, [completedTasks, sectionId]);

  const sectionIncompletedTasks = useMemo(() => {
    return TasksStateHelper.filterBySectionId(incompletedTasks, sectionId);
  }, [incompletedTasks, sectionId]);

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
        sectionIncompletedTasks.length === 0
          ? 0
          : sectionIncompletedTasks.slice(-1)[0].index + 1;

      await createTask(projectId, { sectionId, title, index });
    },
    [createTask, projectId, sectionId, sectionIncompletedTasks]
  );

  const handleCompleteTask = useCallback(
    async (task: Task) => {
      await completeTask(projectId, task.id);
    },
    [completeTask, projectId]
  );

  const handleIncompleteTask = useCallback(
    async (task: Task) => {
      await incompleteTask(projectId, task.id);
    },
    [incompleteTask, projectId]
  );

  const handleDeleteTask = useCallback((task: Task) => {
    setDeletingTask(task);
    setOpenDeleteConfirm(true);
  }, []);

  const handleDeletedTask = useCallback(() => {
    setOpenDeleteConfirm(false);
  }, []);

  const handleCancelDeleteTask = useCallback(() => {
    setOpenDeleteConfirm(false);
  }, []);

  // TODO: リファクタ
  return (
    <>
      {deletingTask && (
        <TaskDeleteConfirmModal
          open={openDeleteConfirm}
          projectId={projectId}
          task={deletingTask}
          selectedTasks={selectedTasks}
          onDeleted={handleDeletedTask}
          onCancel={handleCancelDeleteTask}
        />
      )}
      <Droppable droppableId={droppableId} type="tasks">
        {(provided, snapshot) => (
          <List
            ref={provided.innerRef}
            disablePadding
            sx={{ mb: 2 }}
            {...provided.droppableProps}
          >
            {sectionIncompletedTasks.map((task) => (
              <TaskDraggableListItem
                key={task.id}
                task={task}
                selectedTasks={selectedTasks}
                onComplete={handleCompleteTask}
                onIncomplete={handleIncompleteTask}
                onDelete={handleDeleteTask}
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
      {showCompletedTasks && (
        <List disablePadding sx={{ mb: 2 }}>
          {sectionCompletedTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              selectedTasks={selectedTasks}
              onComplete={handleCompleteTask}
              onIncomplete={handleIncompleteTask}
              onDelete={handleDeleteTask}
              onClick={onClickTask}
              onSelect={onSelectTask}
              onMultiSelect={onMultiSelectTask}
            />
          ))}
        </List>
      )}
    </>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
