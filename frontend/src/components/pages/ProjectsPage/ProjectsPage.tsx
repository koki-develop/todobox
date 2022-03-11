import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import { useProjects } from "@/components/providers/ProjectsProvider";
import ProjectCardList from "@/components/model/project/ProjectCardList";
import ProjectDeleteConfirmModal from "@/components/model/project/ProjectDeleteConfirmModal";
import ProjectModalForm from "@/components/model/project/ProjectModalForm";
import Field from "@/components/utils/Field";
import Loading from "@/components/utils/Loading";
import { Project } from "@/models/project";
import {
  createProject,
  updateOrAddProjectState,
  updateProject,
} from "@/lib/projectUtils";
import { useToast } from "@/hooks/useToast";

export type ProjectsPageProps = {
  currentUser: User;
};

const ProjectsPage: React.VFC<ProjectsPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const { initialized: projectsLoaded, projects, setProjects } = useProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] =
    useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);

  const { showToast } = useToast();

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

  const handleCreateProject = useCallback(
    (createdProject: Project) => {
      setLoadingForm(true);
      createProject(currentUser.uid, createdProject)
        .then(() => {
          showToast("プロジェクトを作成しました。", "success");
          setProjects((prev) => {
            return updateOrAddProjectState(prev, createdProject);
          });
          setOpenProjectForm(false);
        })
        .finally(() => {
          setLoadingForm(false);
        });
    },
    [currentUser.uid, setProjects, showToast]
  );

  const handleUpdateProject = useCallback(
    (updatedProject: Project) => {
      setLoadingForm(true);
      updateProject(currentUser.uid, updatedProject)
        .then(() => {
          showToast("プロジェクトを更新しました。", "success");
          setProjects((prev) => {
            return updateOrAddProjectState(prev, updatedProject);
          });
          setOpenProjectForm(false);
        })
        .finally(() => {
          setLoadingForm(false);
        });
    },
    [currentUser.uid, setProjects, showToast]
  );

  const handleDeletedProject = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
  }, []);

  return (
    <Container sx={{ pt: 2 }} maxWidth="md">
      {!projectsLoaded && <Loading text="プロジェクトを読み込んでいます" />}
      {projectsLoaded && (
        <Box>
          <ProjectModalForm
            loading={loadingForm}
            open={openProjectForm}
            project={editingProject}
            onClose={handleCloseProjectForm}
            onCreate={handleCreateProject}
            onUpdate={handleUpdateProject}
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
