import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import { useProjects } from "@/components/providers/ProjectsProvider";
import ProjectCardList from "@/components/model/project/ProjectCardList";
import ProjectForm from "@/components/model/project/ProjectForm";
import Field from "@/components/utils/Field";
import Loading from "@/components/utils/Loading";
import { Project } from "@/models/project";
import {
  createProject,
  deleteProject,
  deleteProjectState,
  updateOrAddProjectState,
  updateProject,
} from "@/lib/projectUtils";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const { initialized: projectsLoaded, projects, setProjects } = useProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const handleClickAddProject = useCallback(() => {
    setEditingProject(null);
    setOpenProjectForm(true);
  }, []);

  const handleCloseProjectForm = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleCreateProject = useCallback(
    (createdProject: Project) => {
      setLoadingForm(true);
      createProject(currentUser.uid, createdProject)
        .then(() => {
          setProjects((prev) => {
            return updateOrAddProjectState(prev, createdProject);
          });
          setOpenProjectForm(false);
        })
        .finally(() => {
          setLoadingForm(false);
        });
    },
    [currentUser.uid, setProjects]
  );

  const handleUpdateProject = useCallback(
    (updatedProject: Project) => {
      setLoadingForm(true);
      updateProject(currentUser.uid, updatedProject)
        .then(() => {
          setProjects((prev) => {
            return updateOrAddProjectState(prev, updatedProject);
          });
          setOpenProjectForm(false);
        })
        .finally(() => {
          setLoadingForm(false);
        });
    },
    [currentUser.uid, setProjects]
  );

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setOpenProjectForm(true);
  }, []);

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
        <Box>
          <ProjectForm
            loading={loadingForm}
            open={openProjectForm}
            project={editingProject}
            onClose={handleCloseProjectForm}
            onCreate={handleCreateProject}
            onUpdate={handleUpdateProject}
          />

          <Field sx={{ display: "flex", justifyContent: "center" }}>
            <Button startIcon={<AddIcon />} onClick={handleClickAddProject}>
              プロジェクトを作成
            </Button>
          </Field>

          <Field>
            <ProjectCardList
              projects={projects}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          </Field>
        </Box>
      )}
    </Container>
  );
});

ProjectsPage.displayName = "ProjectsPage";

export default ProjectsPage;
