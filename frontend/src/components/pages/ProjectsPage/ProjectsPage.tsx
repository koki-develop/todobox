import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { User } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import ProjectForm from "@/components/model/project/ProjectForm";
import ProjectList from "@/components/model/project/ProjectList";
import Field from "@/components/utils/Field";
import { Project } from "@/models/project";
import {
  createProject,
  deleteProject,
  deleteProjectState,
  listenProjects,
  updateOrAddProjectState,
} from "@/lib/projectUtils";
import Loading from "@/components/utils/Loading";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [creatingProject, setCreatingProject] = useState<boolean>(false);
  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const handleOpenProjectForm = useCallback(() => {
    setOpenProjectForm(true);
  }, []);

  const handleCloseProjectForm = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleCreateProject = useCallback(
    async (project: Project) => {
      setCreatingProject(true);
      createProject(currentUser.uid, project)
        .then(() => {
          setProjects((prev) => {
            return updateOrAddProjectState(prev, project);
          });
          setOpenProjectForm(false);
        })
        .finally(() => {
          setCreatingProject(false);
        });
    },
    [currentUser.uid]
  );

  const handleDeleteProject = useCallback(
    (project: Project) => {
      deleteProject(currentUser.uid, project.id).then(() => {
        setProjects((prev) => {
          return deleteProjectState(prev, project.id);
        });
      });
    },
    [currentUser.uid]
  );

  useEffect(() => {
    const unsubscribe = listenProjects(currentUser.uid, (projects) => {
      setProjectsLoaded(true);
      setProjects(projects);
    });
    return unsubscribe;
  }, [currentUser.uid]);

  return (
    <Box>
      {!projectsLoaded && <Loading text="プロジェクトを読み込んでいます" />}
      {projectsLoaded && (
        <>
          <ProjectForm
            loading={creatingProject}
            open={openProjectForm}
            onClose={handleCloseProjectForm}
            onCreate={handleCreateProject}
          />

          <Field sx={{ display: "flex", justifyContent: "center" }}>
            <Button startIcon={<AddIcon />} onClick={handleOpenProjectForm}>
              プロジェクトを作成
            </Button>
          </Field>

          <Field>
            <ProjectList
              projects={projects}
              onDeleteProject={handleDeleteProject}
            />
          </Field>
        </>
      )}
    </Box>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
