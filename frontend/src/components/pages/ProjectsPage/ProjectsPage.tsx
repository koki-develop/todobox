import { signOut, User } from "firebase/auth";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ulid } from "ulid";
import { Project } from "@/models/project";
import { auth, firestore } from "@/lib/firebase";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState<string>("");

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    []
  );

  const handleCreateProject = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName === "") return;
    setName("");
    const id = ulid();
    const project: Omit<Project, "id"> = { name: trimmedName };

    const ref = doc(firestore, "users", currentUser.uid, "projects", id);
    setDoc(ref, project);
  }, [currentUser.uid, name]);

  useEffect(() => {
    const ref = collection(firestore, "users", currentUser.uid, "projects");
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setProjectsLoaded(true);
      setProjects(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project))
      );
    });
    return unsubscribe;
  }, [currentUser.uid]);

  if (!projectsLoaded) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <button onClick={() => signOut(auth)}>signout</button>
      <div>
        <input type="text" value={name} onChange={handleChangeName} />
        <button onClick={handleCreateProject}>create</button>
      </div>

      <div>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
