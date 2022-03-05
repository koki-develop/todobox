import { User } from "firebase/auth";
import { writeBatch } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import SectionList from "@/components/model/section/SectionList";
import TaskList from "@/components/model/task/TaskList";
import { Project } from "@/models/project";
import { Section } from "@/models/section";
import { Task } from "@/models/task";
import { firestore } from "@/lib/firebase";
import { listenProject } from "@/lib/projectUtils";
import {
  createSection,
  deleteSectionBatch,
  deleteSectionState,
  listenSections,
  moveSectionState,
  updateOrAddSectionState,
  updateSections,
  updateSectionsBatch,
} from "@/lib/sectionUtils";
import {
  completeTaskState,
  createTask,
  deleteTaskBatch,
  deleteTaskState,
  getTasksByRange,
  incompleteTaskState,
  moveTaskState,
  moveTasksState,
  deleteTasksState,
  updateOrAddTaskState,
  updateTasks,
  updateTasksBatch,
  deleteTasksBatch,
  listenIncompletedTasks,
  listenCompletedTasks,
  separateTasks,
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
  const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);
  const [allTasks, setAllTasks] = useState<{
    completed: Task[];
    incompleted: Task[];
  }>({ completed: [], incompleted: [] });
  const [incompletedTasksLoaded, setIncompletedTasksLoaded] =
    useState<boolean>(false);
  const [completedTasksLoaded, setCompletedTasksLoaded] =
    useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  /*
   * project
   */

  useEffect(() => {
    const unsubscribe = listenProject(currentUser.uid, projectId, (project) => {
      setProject(project);
      setProjectLoaded(true);
    });
    return unsubscribe;
  }, [currentUser.uid, projectId]);

  /*
   * section
   */

  const handleCreateSection = useCallback(
    (createdSection: Section) => {
      setSections((prev) => updateOrAddSectionState(prev, createdSection));
      createSection(currentUser.uid, createdSection);
    },
    [currentUser.uid]
  );

  const handleDeleteSection = useCallback(
    (deletedSection: Section) => {
      setSections((prev) => {
        const batch = writeBatch(firestore);
        const next = deleteSectionState(prev, deletedSection.id);
        updateSectionsBatch(batch, currentUser.uid, next);
        deleteSectionBatch(
          batch,
          currentUser.uid,
          projectId,
          deletedSection.id
        );
        batch.commit();
        return next;
      });
    },
    [currentUser.uid, projectId]
  );

  const handleDragEndSection = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;

      const fromIndex = source.index;
      const toIndex = destination.index;
      if (fromIndex === toIndex) return;

      setSections((prev) => {
        const next = moveSectionState(prev, fromIndex, toIndex);
        updateSections(currentUser.uid, next);
        return next;
      });
    },
    [currentUser.uid]
  );

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

  /*
   * task
   */

  const noSectionTasks = useMemo(() => {
    return [...allTasks.completed, ...allTasks.incompleted].filter(
      (task) => task.sectionId == null
    );
  }, [allTasks.completed, allTasks.incompleted]);

  const completedTasks = useMemo(() => {
    if (!showCompletedTasks) return [];
    return allTasks.completed;
  }, [allTasks.completed, showCompletedTasks]);

  const incompletedTasks = useMemo(() => {
    return allTasks.incompleted;
  }, [allTasks.incompleted]);

  const handleChangeShowCompletedTasks = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShowCompletedTasks(e.currentTarget.checked);
    },
    []
  );

  const handleCompleteTask = useCallback(
    (completedTask: Task) => {
      setAllTasks((prev) => {
        const next = completeTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          completedTask.id
        );
        updateTasks(currentUser.uid, next);
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
      setSelectedTasks(
        selectedTasks.filter(
          (selectedTask) => selectedTask.id !== completedTask.id
        )
      );
    },
    [currentUser.uid, sections, selectedTasks]
  );

  const handleIncompleteTask = useCallback(
    (incompletedTask: Task) => {
      setAllTasks((prev) => {
        const next = incompleteTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          incompletedTask.id
        );
        updateTasks(currentUser.uid, next);
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
    },
    [currentUser.uid, sections]
  );

  const handleCreateTask = useCallback(
    (createdTask: Task) => {
      setAllTasks((prev) => {
        const next = updateOrAddTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          createdTask
        );
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
      createTask(currentUser.uid, createdTask);
    },
    [currentUser.uid, sections]
  );

  const handleDeleteTask = useCallback(
    (deletedTask: Task) => {
      setAllTasks((prev) => {
        if (
          selectedTasks.length > 1 &&
          selectedTasks.some(
            (selectedTask) => selectedTask.id === deletedTask.id
          )
        ) {
          // 複数削除
          const deletedTaskIds = selectedTasks.map(
            (selectedTask) => selectedTask.id
          );
          const next = deleteTasksState(
            sections,
            [...prev.completed, ...prev.incompleted],
            deletedTaskIds
          );
          const batch = writeBatch(firestore);
          updateTasksBatch(batch, currentUser.uid, next);
          deleteTasksBatch(batch, currentUser.uid, projectId, deletedTaskIds);
          batch.commit();
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        } else {
          // 単一削除
          const next = deleteTaskState(
            sections,
            [...prev.completed, ...prev.incompleted],
            deletedTask.id
          );
          const batch = writeBatch(firestore);
          updateTasksBatch(batch, currentUser.uid, next);
          deleteTaskBatch(batch, currentUser.uid, projectId, deletedTask.id);
          batch.commit();
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        }
      });
    },
    [currentUser.uid, projectId, sections, selectedTasks]
  );

  const handleClickTask = useCallback((clickedTask: Task) => {
    console.log("clicked:", clickedTask);
  }, []);

  const handleSelectTask = useCallback(
    (selectedTask: Task) => {
      if (selectedTask.completedAt) return;
      if (selectedTasks.some((prevTask) => prevTask.id === selectedTask.id)) {
        setSelectedTasks(
          selectedTasks.filter((prevTask) => prevTask.id !== selectedTask.id)
        );
      } else {
        setSelectedTasks([...selectedTasks, selectedTask]);
      }
    },
    [selectedTasks]
  );

  const handleMultiSelectTask = useCallback(
    (selectedTask: Task) => {
      if (selectedTask.completedAt) return;
      if (selectedTasks.length === 0) {
        setSelectedTasks([selectedTask]);
        return;
      }
      const toTask = selectedTasks.slice(-1)[0];
      const range = getTasksByRange(
        sections,
        incompletedTasks,
        selectedTask.id,
        toTask.id
      ).filter((task) => !task.completedAt);
      setSelectedTasks([
        ...selectedTasks.filter(
          (task) => !range.some((rangeTask) => rangeTask.id === task.id)
        ),
        ...range,
      ]);
    },
    [incompletedTasks, sections, selectedTasks]
  );

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
        setAllTasks((prev) => {
          const next = moveTaskState(
            sections,
            [...prev.completed, ...prev.incompleted],
            taskId,
            toSectionId,
            toIndex
          );
          updateTasks(currentUser.uid, next);
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        });
      } else {
        // 複数移動
        const firstTaskId = taskId;
        const otherTaskIds = selectedTasks
          .filter((selectedTask) => selectedTask.id !== firstTaskId)
          .map((selectedTask) => selectedTask.id);
        setAllTasks((prev) => {
          const next = moveTasksState(
            sections,
            [...prev.completed, ...prev.incompleted],
            firstTaskId,
            otherTaskIds,
            toSectionId,
            toIndex
          );
          updateTasks(currentUser.uid, next);
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        });
      }
    },
    [currentUser.uid, sections, selectedTasks]
  );

  useEffect(() => {
    if (!project) return;
    const unsubscribe = listenIncompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setAllTasks((prev) => ({ ...prev, incompleted: tasks }));
        setIncompletedTasksLoaded(true);
      }
    );
    return unsubscribe;
  }, [currentUser.uid, project, projectId]);

  useEffect(() => {
    if (!project) return;
    if (!showCompletedTasks) {
      setCompletedTasksLoaded(true);
      return;
    }
    const unsubscribe = listenCompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setAllTasks((prev) => ({ ...prev, completed: tasks }));
        setCompletedTasksLoaded(true);
      }
    );
    return unsubscribe;
  }, [currentUser.uid, project, projectId, showCompletedTasks]);

  /*
   * other
   */

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

  if (
    !projectLoaded ||
    !sectionsLoaded ||
    !incompletedTasksLoaded ||
    !completedTasksLoaded
  ) {
    return <div>loading...</div>;
  }

  return (
    <div>
      {!project && <div>project not found.</div>}
      {project && (
        <div>
          <div>{project.name}</div>
          <div>
            <input
              type="checkbox"
              checked={showCompletedTasks}
              onChange={handleChangeShowCompletedTasks}
            />
          </div>
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
                tasks={[...completedTasks, ...incompletedTasks]}
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
