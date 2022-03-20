import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { User } from "firebase/auth";
import qs from "query-string";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProjectDeleteConfirmModal from "@/components/model/project/ProjectDeleteConfirmModal";
import ProjectListener from "@/components/model/project/ProjectListener";
import ProjectModalForm from "@/components/model/project/ProjectModalForm";
import SectionList from "@/components/model/section/SectionList";
import SectionsListener from "@/components/model/section/SectionsListener";
import TaskList from "@/components/model/task/TaskList";
import TaskModalCard from "@/components/model/task/TaskModalCard";
import TasksListener from "@/components/model/task/TasksListener";
import Field from "@/components/utils/Field";
import Link from "@/components/utils/Link";
import Loading from "@/components/utils/Loading";
import PopperList from "@/components/utils/PopperList";
import PopperListItem from "@/components/utils/PopperListItem";
import { Task } from "@/models/task";
import { TasksStateHelper } from "@/lib/tasksStateHelper";
import { useProjects } from "@/hooks/projectsHooks";
import { useSections } from "@/hooks/sectionsHooks";
import { useTasks } from "@/hooks/taskHooks";

export type ProjectPageProps = {
  currentUser: User;
};

const ProjectPage: React.VFC<ProjectPageProps> = React.memo(() => {
  const params = useParams();
  const projectId = params.id as string;
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const { project, projectInitialized } = useProjects();
  const { sections, sectionsInitialized, moveSection } = useSections();
  const { incompletedTasks, tasksInitialized, moveTask, moveTasks } =
    useTasks();

  const projectMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const completedFilterMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  const [openProjectMenu, setOpenProjectMenu] = useState<boolean>(false);
  const [openCompletedFilterMenu, setOpenCompletedFilterMenu] =
    useState<boolean>(false);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);
  const [openDeleteProjectConfirm, setOpenDeleteProjectConfirm] =
    useState<boolean>(false);

  const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [showingTaskId, setShowingTaskId] = useState<string | null>(null);
  const [openTaskModal, setOpenTaskModal] = useState<boolean>(false);

  /*
   * project
   */

  const handleOpenProjectMenu = useCallback(() => {
    setOpenProjectMenu(true);
  }, []);

  const handleCloseProjectMenu = useCallback(() => {
    setOpenProjectMenu(false);
  }, []);

  const handleEditProject = useCallback(() => {
    setOpenProjectMenu(false);
    setOpenProjectForm(true);
  }, []);

  const handleUpdatedProject = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  const handleDeleteProject = useCallback(() => {
    setOpenProjectMenu(false);
    setOpenDeleteProjectConfirm(true);
  }, []);

  const handleDeletedProject = useCallback(() => {
    navigate("/projects");
  }, [navigate]);

  const handleCancelDeleteProject = useCallback(() => {
    setOpenDeleteProjectConfirm(false);
  }, []);

  const handleCloseProjectForm = useCallback(() => {
    setOpenProjectForm(false);
  }, []);

  /*
   * section
   */

  const handleDragEndSection = useCallback(
    (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;
      if (source.index === destination.index) return;
      moveSection(projectId, draggableId, destination.index);
    },
    [moveSection, projectId]
  );

  /*
   * task
   */

  const handleSelectAllTasks = useCallback(() => {
    setShowCompletedTasks(true);
    setOpenCompletedFilterMenu(false);
  }, []);

  const handleSelectIncompletedTasks = useCallback(() => {
    setShowCompletedTasks(false);
    setOpenCompletedFilterMenu(false);
  }, []);

  const handleClickChangeShowCompletedTasks = useCallback(() => {
    setOpenCompletedFilterMenu(true);
  }, []);

  const handleCloseShowCompletedTasks = useCallback(() => {
    setOpenCompletedFilterMenu(false);
  }, []);

  const handleClickTask = useCallback(
    (clickedTask: Task) => {
      navigate(`?task=${clickedTask.id}`);
    },
    [navigate]
  );

  const handleCloseTaskModal = useCallback(() => {
    navigate("");
  }, [navigate]);

  const handleSelectTask = useCallback(
    (selectedTask: Task) => {
      if (selectedTask.completedAt) return;
      if (selectedTasks.some((prevTask) => prevTask.id === selectedTask.id)) {
        setSelectedTasks(
          selectedTasks.filter((prevTask) => prevTask.id !== selectedTask.id)
        );
      } else {
        setSelectedTasks([...selectedTasks, selectedTask]);
      }
    },
    [selectedTasks]
  );

  const handleMultiSelectTask = useCallback(
    (selectedTask: Task) => {
      if (selectedTask.completedAt) return;
      if (selectedTasks.length === 0) {
        setSelectedTasks([selectedTask]);
        return;
      }
      const toTask = selectedTasks.slice(-1)[0];
      const range = TasksStateHelper.getTasksByRange(
        incompletedTasks,
        sections,
        selectedTask.id,
        toTask.id
      ).filter((task) => !task.completedAt);
      setSelectedTasks([
        ...selectedTasks.filter(
          (task) => !range.some((rangeTask) => rangeTask.id === task.id)
        ),
        ...range,
      ]);
    },
    [incompletedTasks, sections, selectedTasks]
  );

  const handleDragEndTask = useCallback(
    async (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      const fromSectionId =
        source.droppableId === "none" ? null : source.droppableId;
      const srcIndex = source.index;
      const toSectionId =
        destination.droppableId === "none" ? null : destination.droppableId;
      const toIndex = destination.index;
      if (fromSectionId === toSectionId && srcIndex === toIndex) return;

      const taskId = result.draggableId;

      if (
        selectedTasks.length === 0 ||
        (selectedTasks.length === 1 && selectedTasks[0].id === taskId) ||
        !selectedTasks.some((selectedTask) => selectedTask.id === taskId)
      ) {
        // 単一移動
        await moveTask(projectId, taskId, toSectionId, toIndex);
      } else {
        // 複数移動
        const otherTaskIds = selectedTasks
          .filter((selectedTask) => selectedTask.id !== taskId)
          .map((selectedTask) => selectedTask.id);
        await moveTasks(projectId, taskId, otherTaskIds, toSectionId, toIndex);
      }
    },
    [moveTask, moveTasks, projectId, selectedTasks]
  );

  useEffect(() => {
    const query = qs.parse(location.search);
    const taskId = (query.task as string) ?? null;
    if (taskId) {
      setShowingTaskId(taskId);
      setOpenTaskModal(true);
    } else {
      setOpenTaskModal(false);
    }
  }, [location.search]);

  useEffect(() => {
    setSelectedTasks((prev) => {
      return prev.filter((prevSelectedTask) => {
        return incompletedTasks.some(
          (incompletedTask) => incompletedTask.id === prevSelectedTask.id
        );
      });
    });
  }, [incompletedTasks]);

  /*
   * other
   */

  const headerHeight = 56;

  const loaded = useMemo(() => {
    return projectInitialized && sectionsInitialized && tasksInitialized;
  }, [projectInitialized, sectionsInitialized, tasksInitialized]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      switch (result.type) {
        case "tasks":
          handleDragEndTask(result);
          break;
        case "sections":
          handleDragEndSection(result);
          break;
      }
    },
    [handleDragEndTask, handleDragEndSection]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <ProjectListener projectId={projectId} />
      <SectionsListener projectId={projectId} />
      <TasksListener projectId={projectId} withCompleted={showCompletedTasks} />

      {!loaded && <Loading />}
      {loaded && !project && (
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ mb: 1 }}>
            プロジェクトが見つかりませんでした
          </Typography>
          <Link to="/projects">プロジェクト一覧へ</Link>
        </Box>
      )}
      {loaded && project && (
        <>
          <ProjectModalForm
            open={openProjectForm}
            project={project}
            onUpdated={handleUpdatedProject}
            onClose={handleCloseProjectForm}
          />
          <ProjectDeleteConfirmModal
            open={openDeleteProjectConfirm}
            project={project}
            onCancel={handleCancelDeleteProject}
            onDeleted={handleDeletedProject}
          />
          {showingTaskId && (
            <TaskModalCard
              projectId={projectId}
              taskId={showingTaskId}
              open={openTaskModal}
              onClose={handleCloseTaskModal}
            />
          )}

          {/* project header */}
          <Container maxWidth="lg">
            <Field
              sx={{
                alignItems: "center",
                display: "flex",
                height: headerHeight,
                position: "sticky",
                py: 1,
                top: 0,
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4">{project.name}</Typography>
              </Box>
              <Box>
                <IconButton
                  ref={projectMenuButtonRef}
                  onClick={handleOpenProjectMenu}
                >
                  <MoreHorizIcon />
                </IconButton>
                <PopperList
                  anchorEl={projectMenuButtonRef.current}
                  open={openProjectMenu}
                  onClose={handleCloseProjectMenu}
                >
                  <PopperListItem onClick={handleEditProject}>
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="プロジェクトを編集" />
                  </PopperListItem>
                  <PopperListItem onClick={handleDeleteProject}>
                    <ListItemIcon>
                      <DeleteIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="プロジェクトを削除"
                      primaryTypographyProps={{
                        sx: { color: theme.palette.error.main },
                      }}
                    />
                  </PopperListItem>
                </PopperList>
              </Box>
            </Field>
          </Container>
          <Divider />

          {/* content */}
          <Container
            maxWidth="lg"
            sx={{ flexGrow: 1, overflowY: "auto", pb: 2 }}
          >
            <Box sx={{ display: "flex", my: 1, justifyContent: "flex-end" }}>
              <Button
                ref={completedFilterMenuButtonRef}
                onClick={handleClickChangeShowCompletedTasks}
                startIcon={<CheckCircleOutlineIcon />}
              >
                {showCompletedTasks ? "すべてのタスク" : "未完了のタスク"}
              </Button>
              <PopperList
                open={openCompletedFilterMenu}
                anchorEl={completedFilterMenuButtonRef.current}
                onClose={handleCloseShowCompletedTasks}
              >
                <PopperListItem onClick={handleSelectAllTasks}>
                  <ListItemIcon>
                    {showCompletedTasks && <CheckIcon />}
                  </ListItemIcon>
                  <ListItemText primary="すべてのタスク" />
                </PopperListItem>
                <PopperListItem onClick={handleSelectIncompletedTasks}>
                  <ListItemIcon>
                    {!showCompletedTasks && <CheckIcon />}
                  </ListItemIcon>
                  <ListItemText primary="未完了のタスク" />
                </PopperListItem>
              </PopperList>
            </Box>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Box>
                <Box>
                  <TaskList
                    projectId={projectId}
                    sectionId={null}
                    selectedTasks={selectedTasks}
                    showCompletedTasks={showCompletedTasks}
                    onClickTask={handleClickTask}
                    onSelectTask={handleSelectTask}
                    onMultiSelectTask={handleMultiSelectTask}
                  />
                </Box>
                <SectionList
                  projectId={projectId}
                  selectedTasks={selectedTasks}
                  showCompletedTasks={showCompletedTasks}
                  onClickTask={handleClickTask}
                  onSelectTask={handleSelectTask}
                  onMultiSelectTask={handleMultiSelectTask}
                />
              </Box>
            </DragDropContext>
          </Container>
        </>
      )}
    </Box>
  );
});

ProjectPage.displayName = "ProjectPage";

export default ProjectPage;
