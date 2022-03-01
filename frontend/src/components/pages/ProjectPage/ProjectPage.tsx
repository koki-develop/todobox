import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { ulid } from "ulid";
import SectionList from "@/components/model/section/SectionList";
import TaskList from "@/components/model/task/TaskList";
import { Project } from "@/models/project";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

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
  const id = params.id as string;

  const [projectLoaded, setProjectLoaded] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleDragEndTask = useCallback((result: DropResult) => {
    const { destination } = result;
    if (!destination) return;

    const taskId = result.draggableId;
    const destSectionId =
      destination.droppableId === "none" ? null : destination.droppableId;
    const destIndex = destination.index;
    console.log({ taskId, destIndex, destSectionId });
  }, []);

  const handleDragEndSection = useCallback((result: DropResult) => {
    const { destination } = result;
    if (!destination) return;

    const sectionId = result.draggableId;
    const destIndex = destination.index;
    console.log({ sectionId, destIndex });
  }, []);

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
      setProject({ id, name: "sample project" });
      setSections(dummySections);
      setTasks(dummyTasks);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [id]);

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
                  tasks={tasks.filter((task) => task.sectionId == null)}
                />
              </div>
              <SectionList sections={sections} tasks={tasks} />
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
});

ProjectPage.displayName = "ProjectPage";

export default ProjectPage;
