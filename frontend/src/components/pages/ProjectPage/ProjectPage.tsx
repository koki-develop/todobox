import React, { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { ulid } from "ulid";
import { Project } from "@/models/project";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

const dummySections: Section[] = [
  { id: ulid(), name: "section 1" },
  { id: ulid(), name: "section 2" },
  { id: ulid(), name: "section 3" },
];

const dummyTasks: Task[] = [
  { sectionId: null, id: ulid(), title: "task 1" },
  { sectionId: null, id: ulid(), title: "task 2" },
  { sectionId: dummySections[0].id, id: ulid(), title: "task 3" },
  { sectionId: dummySections[0].id, id: ulid(), title: "task 4" },
  { sectionId: dummySections[1].id, id: ulid(), title: "task 5" },
  { sectionId: dummySections[1].id, id: ulid(), title: "task 6" },
  { sectionId: dummySections[2].id, id: ulid(), title: "task 7" },
  { sectionId: dummySections[2].id, id: ulid(), title: "task 8" },
  { sectionId: dummySections[2].id, id: ulid(), title: "task 9" },
  { sectionId: dummySections[2].id, id: ulid(), title: "task 10" },
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

    const destSectionId =
      destination.droppableId === "none" ? null : destination.droppableId;
    const destIndex = destination.index;
    console.log({ destIndex, destSectionId });
  }, []);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      switch (result.type) {
        case "tasks":
          handleDragEndTask(result);
          break;
      }
    },
    [handleDragEndTask]
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
                <Droppable droppableId="none" type="tasks">
                  {(provided) => (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                      {tasks
                        .filter((task) => task.sectionId == null)
                        .map((task, i) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={i}
                          >
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {task.title}
                              </li>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </div>
              <div>
                {sections.map((section) => (
                  <div key={section.id}>
                    <div>{section.name}</div>
                    <Droppable droppableId={section.id} type="tasks">
                      {(provided) => (
                        <ul
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {tasks
                            .filter((task) => task.sectionId === section.id)
                            .map((task, i) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={i}
                              >
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {task.title}
                                  </li>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
});

ProjectPage.displayName = "ProjectPage";

export default ProjectPage;
