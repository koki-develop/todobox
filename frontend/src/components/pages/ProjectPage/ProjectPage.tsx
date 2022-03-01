import { arrayMoveImmutable } from "array-move";
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

  // TODO: リファクタ
  const handleDragEndTask = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;

      const task = tasks.find((task) => task.id === result.draggableId);
      if (!task) return;

      const srcSectionId =
        source.droppableId === "none" ? null : source.droppableId;
      const srcIndex = source.index;
      const destSectionId =
        destination.droppableId === "none" ? null : destination.droppableId;
      const destIndex = destination.index;
      if (srcSectionId === destSectionId && srcIndex === destIndex) return;

      const srcSectionTasks = tasks
        .filter((task) => task.sectionId === srcSectionId)
        .sort((a, b) => a.index - b.index);

      if (srcSectionId === destSectionId) {
        // 同一セクション内の移動
        const nextSrcSectionTasks = arrayMoveImmutable(
          srcSectionTasks,
          srcIndex,
          destIndex
        ).map((task, i) => ({ ...task, index: i }));
        setTasks(
          tasks.map((prevTask) => {
            const nextTask = nextSrcSectionTasks.find(
              (task) => prevTask.id === task.id
            );
            return nextTask ?? prevTask;
          })
        );
      } else {
        // 異なるセクション間の移動
        const nextSrcSectionTasks = srcSectionTasks
          .filter((prevTask) => prevTask.id !== task.id)
          .map((task, i) => ({ ...task, index: i }));

        const destSectionTasks = tasks
          .filter((task) => task.sectionId === destSectionId)
          .sort((a, b) => a.index - b.index);
        const nextDestSectionTasks = (
          destSectionTasks.length === 0
            ? [{ ...task, sectionId: destSectionId }]
            : destSectionTasks.reduce((result, current, i) => {
                if (i === destIndex) {
                  return [
                    ...result,
                    { ...task, sectionId: destSectionId },
                    current,
                  ];
                } else {
                  return [...result, current];
                }
              }, [] as Task[])
        ).map((task, i) => ({ ...task, index: i }));
        setTasks(
          tasks.map((prevTask) => {
            const nextTask = [
              ...nextSrcSectionTasks,
              ...nextDestSectionTasks,
            ].find((task) => prevTask.id === task.id);
            return nextTask ?? prevTask;
          })
        );
      }
    },
    [tasks]
  );

  const handleDragEndSection = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;

      const srcIndex = source.index;
      const destIndex = destination.index;
      if (srcIndex === destIndex) return;

      const nextSections = arrayMoveImmutable(
        sections,
        srcIndex,
        destIndex
      ).map((section, i) => ({ ...section, index: i }));
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
