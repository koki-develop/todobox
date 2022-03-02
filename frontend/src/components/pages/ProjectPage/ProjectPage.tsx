import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { ulid } from "ulid";
import SectionList from "@/components/model/section/SectionList";
import TaskList from "@/components/model/task/TaskList";
import { Project } from "@/models/project";
import { Section } from "@/models/section";
import { Task } from "@/models/task";
import { arrayMove } from "@/lib/arrayUtils";
import { getTasksRange, moveTask, moveTasks, sortTasks } from "@/lib/taskUtils";

const dummySections: Section[] = [
  { projectId: "dummyprojectid", id: ulid(), index: 0, name: "section 1" },
  { projectId: "dummyprojectid", id: ulid(), index: 1, name: "section 2" },
  { projectId: "dummyprojectid", id: ulid(), index: 2, name: "section 3" },
];

const dummyTasks: Task[] = [
  { sectionId: null, id: ulid(), index: 0, title: "task 1" },
  { sectionId: null, id: ulid(), index: 1, title: "task 2" },
  { sectionId: dummySections[0].id, index: 0, id: ulid(), title: "task 3" },
  { sectionId: dummySections[0].id, index: 1, id: ulid(), title: "task 4" },
  { sectionId: dummySections[1].id, index: 0, id: ulid(), title: "task 5" },
  { sectionId: dummySections[1].id, index: 1, id: ulid(), title: "task 6" },
  { sectionId: dummySections[2].id, index: 0, id: ulid(), title: "task 7" },
  { sectionId: dummySections[2].id, index: 1, id: ulid(), title: "task 8" },
  { sectionId: dummySections[2].id, index: 2, id: ulid(), title: "task 9" },
  { sectionId: dummySections[2].id, index: 3, id: ulid(), title: "task 10" },
];

const ProjectPage: React.VFC = React.memo(() => {
  const params = useParams();
  const projectId = params.id as string;

  const [projectLoaded, setProjectLoaded] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const noSectionTasks = useMemo(() => {
    return tasks.filter((task) => task.sectionId == null);
  }, [tasks]);

  const handleCreateSection = useCallback(
    (section: Section) => {
      setSections([...sections, section]);
    },
    [sections]
  );

  const handleCreateTask = useCallback(
    (task: Task) => {
      setTasks(sortTasks(sections, [...tasks, task]));
    },
    [sections, tasks]
  );

  const handleClickTask = useCallback((task: Task) => {
    console.log("clicked:", task);
  }, []);

  const handleSelectTask = useCallback(
    (task: Task) => {
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
      if (selectedTasks.length === 0) {
        setSelectedTasks([task]);
        return;
      }
      const toTask = selectedTasks.slice(-1)[0];
      const range = getTasksRange(sections, tasks, task.id, toTask.id);
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

      const srcIndex = source.index;
      const destIndex = destination.index;
      if (srcIndex === destIndex) return;

      const nextSections = arrayMove(sections, srcIndex, destIndex).map(
        (section, i) => ({ ...section, index: i })
      );
      setSections(nextSections);
    },
    [sections]
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

  useEffect(() => {
    setProjectLoaded(false);
    const timeoutId = setTimeout(() => {
      setProjectLoaded(true);
      setProject({ id: projectId, name: "sample project" });
      setSections(dummySections);
      setTasks(dummyTasks);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [projectId]);

  if (!projectLoaded) {
    return <div>loading...</div>;
  }

  return (
    <div>
      {project && (
        <div>
          <div>{project.name}</div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div>
              <div>
                <TaskList
                  sectionId={null}
                  tasks={noSectionTasks}
                  selectedTasks={selectedTasks}
                  onCreateTask={handleCreateTask}
                  onClickTask={handleClickTask}
                  onSelectTask={handleSelectTask}
                  onMultiSelectTask={handleMultiSelectTask}
                />
              </div>
              <SectionList
                projectId={projectId}
                sections={sections}
                tasks={tasks}
                selectedTasks={selectedTasks}
                onCreateSection={handleCreateSection}
                onCreateTask={handleCreateTask}
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
