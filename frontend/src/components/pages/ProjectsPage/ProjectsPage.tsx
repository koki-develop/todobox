import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import ProjectCardList from "@/components/model/project/ProjectCardList";
import ProjectDeleteConfirmModal from "@/components/model/project/ProjectDeleteConfirmModal";
import ProjectModalForm from "@/components/model/project/ProjectModalForm";
import { useProjects } from "@/components/model/project/projectHooks";
import Field from "@/components/utils/Field";
import Loading from "@/components/utils/Loading";
import { Project } from "@/models/project";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const { projects, initialized: projectsLoaded } = useProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] =
    useState<boolean>(false);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const handleClickAddProject = useCallback(() => {
    setEditingProject(null);
    setOpenProjectForm(true);
  }, []);

  const handleCloseProjectForm = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setOpenProjectForm(true);
  }, []);

  const handleDeleteProject = useCallback((project: Project) => {
    setDeletingProject(project);
    setOpenDeleteConfirmDialog(true);
  }, []);

  const handleCancelDeleteProject = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
  }, []);

  const handleCreatedProject = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleUpdatedProject = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleDeletedProject = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
  }, []);

  return (
    <Container sx={{ pt: 2 }} maxWidth="md">
      {!projectsLoaded && <Loading />}
      {projectsLoaded && (
        <Box>
          <ProjectModalForm
            open={openProjectForm}
            project={editingProject}
            userId={currentUser.uid}
            onClose={handleCloseProjectForm}
            onCreated={handleCreatedProject}
            onUpdated={handleUpdatedProject}
          />
          {deletingProject && (
            <ProjectDeleteConfirmModal
              open={openDeleteConfirmDialog}
              project={deletingProject}
              userId={currentUser.uid}
              onCancel={handleCancelDeleteProject}
              onDeleted={handleDeletedProject}
            />
          )}

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
