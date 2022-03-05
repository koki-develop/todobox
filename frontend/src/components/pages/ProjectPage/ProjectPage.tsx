import { User } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import SectionList from "@/components/model/section/SectionList";
import TaskList from "@/components/model/task/TaskList";
import { Project } from "@/models/project";
import { Section } from "@/models/section";
import { Task } from "@/models/task";
import { listenProject } from "@/lib/projectUtils";
import {
  createSection,
  deleteSection,
  deleteSectionState,
  listenSections,
  moveSectionState,
  updateOrAddSectionState,
  updateSections,
} from "@/lib/sectionUtils";
import {
  completeTask,
  createTask,
  getTasksByRange,
  incompleteTask,
  listenTasks,
  moveTask,
  moveTasks,
  removeTasks,
  sortTasks,
} from "@/lib/taskUtils";

export type ProjectPageProps = {
  currentUser: User;
};

const ProjectPage: React.VFC<ProjectPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const params = useParams();
  const projectId = params.id as string;

  const [projectLoaded, setProjectLoaded] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);
  const [sectionsLoaded, setSectionsLoaded] = useState<boolean>(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const noSectionTasks = useMemo(() => {
    return tasks.filter((task) => task.sectionId == null);
  }, [tasks]);

  const handleCreateSection = useCallback(
    (section: Section) => {
      setSections((prev) => updateOrAddSectionState(prev, section));
      createSection(currentUser.uid, section);
    },
    [currentUser.uid]
  );

  const handleDeleteSection = useCallback(
    (section: Section) => {
      setSections((prev) => deleteSectionState(prev, section.id));
      deleteSection(currentUser.uid, projectId, section.id);
    },
    [currentUser.uid, projectId]
  );

  const handleCompleteTask = useCallback(
    (completedTask: Task) => {
      const updatedTasks = completeTask(sections, tasks, completedTask.id);
      setTasks(updatedTasks);
      setSelectedTasks(
        selectedTasks.filter(
          (selectedTask) => selectedTask.id !== completedTask.id
        )
      );
    },
    [sections, selectedTasks, tasks]
  );

  const handleIncompleteTask = useCallback(
    (incompletedTask: Task) => {
      const updatedTasks = incompleteTask(sections, tasks, incompletedTask.id);
      setTasks(updatedTasks);
    },
    [sections, tasks]
  );

  const handleCreateTask = useCallback(
    (createdTask: Task) => {
      createTask(currentUser.uid, createdTask);
      setTasks(sortTasks(sections, [...tasks, createdTask]));
    },
    [currentUser.uid, sections, tasks]
  );

  const handleDeleteTask = useCallback(
    (deletedTask: Task) => {
      if (
        selectedTasks.some((selectedTask) => selectedTask.id === deletedTask.id)
      ) {
        setTasks(
          removeTasks(
            sections,
            tasks,
            selectedTasks.map((selectedTask) => selectedTask.id)
          )
        );
      } else {
        setTasks(removeTasks(sections, tasks, [deletedTask.id]));
      }
    },
    [sections, selectedTasks, tasks]
  );

  const handleClickTask = useCallback((task: Task) => {
    console.log("clicked:", task);
  }, []);

  const handleSelectTask = useCallback(
    (task: Task) => {
      if (task.completedAt) {
        return;
      }
      if (selectedTasks.some((selectedTask) => selectedTask.id === task.id)) {
        setSelectedTasks(
          selectedTasks.filter((selectedTask) => selectedTask.id !== task.id)
        );
      } else {
        setSelectedTasks([...selectedTasks, task]);
      }
    },
    [selectedTasks]
  );

  const handleMultiSelectTask = useCallback(
    (task: Task) => {
      if (task.completedAt) {
        return;
      }
      if (selectedTasks.length === 0) {
        setSelectedTasks([task]);
        return;
      }
      const toTask = selectedTasks.slice(-1)[0];
      const range = getTasksByRange(sections, tasks, task.id, toTask.id).filter(
        (task) => !task.completedAt
      );
      setSelectedTasks([
        ...selectedTasks.filter(
          (task) => !range.some((rangeTask) => rangeTask.id === task.id)
        ),
        ...range,
      ]);
    },
    [sections, selectedTasks, tasks]
  );

  // TODO: リファクタ
  const handleDragEndTask = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      const fromSectionId =
        source.droppableId === "none" ? null : source.droppableId;
      const srcIndex = source.index;
      const toSectionId =
        destination.droppableId === "none" ? null : destination.droppableId;
      const toIndex = destination.index;
      if (fromSectionId === toSectionId && srcIndex === toIndex) return;

      const taskId = result.draggableId;

      if (
        selectedTasks.length === 0 ||
        (selectedTasks.length === 1 && selectedTasks[0].id === taskId) ||
        !selectedTasks.some((selectedTask) => selectedTask.id === taskId)
      ) {
        // 単一移動
        const movedTasks = moveTask(
          sections,
          tasks,
          taskId,
          toSectionId,
          toIndex
        );
        setTasks(movedTasks);
      } else {
        // 複数移動
        const firstTaskId = taskId;
        const otherTaskIds = selectedTasks
          .filter((selectedTask) => selectedTask.id !== firstTaskId)
          .map((selectedTask) => selectedTask.id);
        const movedTasks = moveTasks(
          sections,
          tasks,
          firstTaskId,
          otherTaskIds,
          toSectionId,
          toIndex
        );
        setTasks(movedTasks);
      }
    },
    [sections, selectedTasks, tasks]
  );

  const handleDragEndSection = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;

      const fromIndex = source.index;
      const toIndex = destination.index;
      if (fromIndex === toIndex) return;

      setSections((prev) => {
        const nextSections = moveSectionState(prev, fromIndex, toIndex);
        updateSections(currentUser.uid, nextSections);
        return nextSections;
      });
    },
    [currentUser.uid]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      switch (result.type) {
        case "tasks":
          handleDragEndTask(result);
          break;
        case "sections":
          handleDragEndSection(result);
          break;
      }
    },
    [handleDragEndTask, handleDragEndSection]
  );

  // project
  useEffect(() => {
    const unsubscribe = listenProject(currentUser.uid, projectId, (project) => {
      setProject(project);
      setProjectLoaded(true);
    });
    return unsubscribe;
  }, [currentUser.uid, projectId]);

  // section
  useEffect(() => {
    if (!project) return;

    const unsubscribe = listenSections(
      currentUser.uid,
      project.id,
      (sections) => {
        setSections(sections);
        setSectionsLoaded(true);
      }
    );
    return unsubscribe;
  }, [currentUser.uid, project]);

  // task
  useEffect(() => {
    if (!project) return;

    const unsubscribe = listenTasks(currentUser.uid, projectId, (tasks) => {
      setTasks(tasks);
      setTasksLoaded(true);
    });
    return unsubscribe;
  }, [currentUser.uid, project, projectId]);

  if (!projectLoaded || !sectionsLoaded || !tasksLoaded) {
    return <div>loading...</div>;
  }

  return (
    <div>
      {!project && <div>project not found.</div>}
      {project && (
        <div>
          <div>{project.name}</div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div>
              <div>
                <TaskList
                  projectId={projectId}
                  sectionId={null}
                  tasks={noSectionTasks}
                  selectedTasks={selectedTasks}
                  onCompleteTask={handleCompleteTask}
                  onIncompleteTask={handleIncompleteTask}
                  onCreateTask={handleCreateTask}
                  onDeleteTask={handleDeleteTask}
                  onClickTask={handleClickTask}
                  onSelectTask={handleSelectTask}
                  onMultiSelectTask={handleMultiSelectTask}
                />
              </div>
              <SectionList
                projectId={projectId}
                sections={sections}
                onCreateSection={handleCreateSection}
                onDeleteSection={handleDeleteSection}
                tasks={tasks}
                selectedTasks={selectedTasks}
                onCompleteTask={handleCompleteTask}
                onIncompleteTask={handleIncompleteTask}
                onCreateTask={handleCreateTask}
                onDeleteTask={handleDeleteTask}
                onClickTask={handleClickTask}
                onSelectTask={handleSelectTask}
                onMultiSelectTask={handleMultiSelectTask}
              />
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
});

ProjectPage.displayName = "ProjectPage";

export default ProjectPage;
