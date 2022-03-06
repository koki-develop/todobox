import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Project } from "@/models/project";
import { listenProjects } from "@/lib/projectUtils";

export type ProjectsContext = {
  initialized: boolean;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};

const projectsContext = createContext<ProjectsContext>({
  initialized: false,
  projects: [],
  setProjects: () => {
    /* */
  },
});

export type ProjectsProviderProps = {
  children: React.ReactNode;
};

const ProjectsProvider: React.VFC<ProjectsProviderProps> = React.memo(
  (props) => {
    const { children } = props;

    const { currentUser } = useAuth();

    const [initialized, setInitialized] = useState<boolean>(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
      if (!currentUser) return;
      const unsubscribe = listenProjects(currentUser.uid, (projects) => {
        setInitialized(true);
        setProjects(projects);
      });
      return unsubscribe;
    }, [currentUser]);

    return (
      <projectsContext.Provider value={{ initialized, projects, setProjects }}>
        {children}
      </projectsContext.Provider>
    );
  }
);

ProjectsProvider.displayName = "ProjectsProvider";

export default ProjectsProvider;

export const useProjects = (): ProjectsContext => useContext(projectsContext);
