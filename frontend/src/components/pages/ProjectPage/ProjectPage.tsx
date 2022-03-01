import React, { useEffect, useMemo, useState } from "react";
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
          <div>
            <div>
              <ul>
                {tasks
                  .filter((task) => task.sectionId == null)
                  .map((task) => (
                    <li key={task.id}>{task.title}</li>
                  ))}
              </ul>
            </div>
            <div>
              {sections.map((section) => (
                <div key={section.id}>
                  <div>{section.name}</div>
                  <ul>
                    {tasks
                      .filter((task) => task.sectionId === section.id)
                      .map((task) => (
                        <li key={task.id}>{task.title}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProjectPage.displayName = "ProjectPage";

export default ProjectPage;