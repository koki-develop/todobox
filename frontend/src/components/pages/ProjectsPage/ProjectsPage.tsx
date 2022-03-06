import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import { useProjects } from "@/components/providers/ProjectsProvider";
import ProjectForm from "@/components/model/project/ProjectForm";
import ProjectList from "@/components/model/project/ProjectList";
import Field from "@/components/utils/Field";
import Loading from "@/components/utils/Loading";
import { Project } from "@/models/project";
import {
  createProject,
  deleteProject,
  deleteProjectState,
  updateOrAddProjectState,
} from "@/lib/projectUtils";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const [creatingProject, setCreatingProject] = useState<boolean>(false);
  const { initialized: projectsLoaded, projects, setProjects } = useProjects();
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
    [currentUser.uid, setProjects]
  );

  const handleDeleteProject = useCallback(
    (project: Project) => {
      deleteProject(currentUser.uid, project.id).then(() => {
        setProjects((prev) => {
          return deleteProjectState(prev, project.id);
        });
      });
    },
    [currentUser.uid, setProjects]
  );

  return (
    <Container sx={{ pt: 2 }} maxWidth="md">
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
    </Container>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
