import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { User } from "firebase/auth";
import React, { useCallback, useState } from "react";
import { useProjects } from "@/components/providers/ProjectsProvider";
import ProjectCardList from "@/components/model/project/ProjectCardList";
import ProjectForm from "@/components/model/project/ProjectForm";
import Field from "@/components/utils/Field";
import LoadableButton from "@/components/utils/LoadableButton";
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
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] =
    useState<boolean>(false);
  const [loadingDeleteConfirmDialog, setLoadingDeleteConfirmDialog] =
    useState<boolean>(false);
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

  const handleDeleteProject = useCallback((project: Project) => {
    setDeletingProject(project);
    setOpenDeleteConfirmDialog(true);
  }, []);

  const handleCancelDeleteProject = useCallback(() => {
    setOpenDeleteConfirmDialog(false);
  }, []);

  const handleConfirmDeleteProject = useCallback(() => {
    if (!deletingProject) return;
    setLoadingDeleteConfirmDialog(true);
    deleteProject(currentUser.uid, deletingProject.id)
      .then(() => {
        setProjects((prev) => {
          return deleteProjectState(prev, deletingProject.id);
        });
        setOpenDeleteConfirmDialog(false);
      })
      .finally(() => {
        setLoadingDeleteConfirmDialog(false);
      });
  }, [currentUser.uid, deletingProject, setProjects]);

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
          <Dialog
            open={openDeleteConfirmDialog}
            onClose={handleCancelDeleteProject}
          >
            <DialogTitle>
              プロジェクト「{deletingProject?.name}」を削除しますか？
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                プロジェクトを削除するとプロジェクト内のセクションとタスクも全て削除されます。この操作は取り消せません。
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDeleteProject}>キャンセル</Button>
              <LoadableButton
                variant="contained"
                color="error"
                loading={loadingDeleteConfirmDialog}
                onClick={handleConfirmDeleteProject}
              >
                削除
              </LoadableButton>
            </DialogActions>
          </Dialog>

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
