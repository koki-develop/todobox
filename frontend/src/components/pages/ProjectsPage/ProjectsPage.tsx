import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import ProjectCardList from "@/components/model/project/ProjectCardList";
import ProjectDeleteConfirmModal from "@/components/model/project/ProjectDeleteConfirmModal";
import ProjectModalForm from "@/components/model/project/ProjectModalForm";
import Field from "@/components/utils/Field";
import Loading from "@/components/utils/Loading";
import { Project } from "@/models/project";
import { useProjects } from "@/hooks/projectsHooks";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo(() => {
  const { projects, projectsInitialized } = useProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] =
    useState<boolean>(false);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const handleCreateProject = useCallback(() => {
    setEditingProject(null);
    setOpenProjectForm(true);
  }, []);

  const handleCreatedProject = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setOpenProjectForm(true);
  }, []);

  const handleUpdatedProject = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setDeletingProject(project);
    setOpenDeleteConfirmDialog(true);
  }, []);

  const handleDeletedProject = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
  }, []);

  const handleCancelDeleteProject = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
  }, []);

  const handleCloseProjectForm = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  return (
    <Container sx={{ py: 2 }} maxWidth="md">
      {!projectsInitialized && <Loading />}
      {projectsInitialized && (
        <Box>
          <ProjectModalForm
            open={openProjectForm}
            project={editingProject}
            onClose={handleCloseProjectForm}
            onCreated={handleCreatedProject}
            onUpdated={handleUpdatedProject}
          />
          {deletingProject && (
            <ProjectDeleteConfirmModal
              open={openDeleteConfirmDialog}
              project={deletingProject}
              onCancel={handleCancelDeleteProject}
              onDeleted={handleDeletedProject}
            />
          )}

          <Field sx={{ display: "flex", justifyContent: "center" }}>
            <Button startIcon={<AddIcon />} onClick={handleCreateProject}>
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
