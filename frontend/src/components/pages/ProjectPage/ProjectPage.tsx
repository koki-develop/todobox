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
import { writeBatch } from "firebase/firestore";
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
import { firestore } from "@/lib/firebase";
import {
  completeTaskState,
  createTask,
  deleteTaskBatch,
  deleteTaskState,
  getTasksByRange,
  incompleteTaskState,
  moveTaskState,
  moveTasksState,
  deleteTasksState,
  updateOrAddTaskState,
  updateTasks,
  updateTasksBatch,
  deleteTasksBatch,
  listenIncompletedTasks,
  listenCompletedTasks,
  separateTasks,
} from "@/lib/taskUtils";
import { useProjects } from "@/hooks/projectHooks";
import { useSections } from "@/hooks/sectionHooks";

export type ProjectPageProps = {
  currentUser: User;
};

const ProjectPage: React.VFC<ProjectPageProps> = React.memo((props) => {
  const { currentUser } = props;

  const params = useParams();
  const projectId = params.id as string;
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const { project, projectInitialized } = useProjects();
  const { sections, sectionsInitialized, moveSection } = useSections();

  const projectMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const completedFilterMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  const [openProjectMenu, setOpenProjectMenu] = useState<boolean>(false);
  const [openCompletedFilterMenu, setOpenCompletedFilterMenu] =
    useState<boolean>(false);
  const [openProjectForm, setOpenProjectForm] = useState<boolean>(false);
  const [openDeleteProjectConfirm, setOpenDeleteProjectConfirm] =
    useState<boolean>(false);

  const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);
  const [allTasks, setAllTasks] = useState<{
    completed: Task[];
    incompleted: Task[];
  }>({ completed: [], incompleted: [] });
  const [incompletedTasksLoaded, setIncompletedTasksLoaded] =
    useState<boolean>(false);
  const [completedTasksLoaded, setCompletedTasksLoaded] =
    useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

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

  const showingTaskId = useMemo(() => {
    const query = qs.parse(location.search);
    return (query.task as string) ?? undefined;
  }, [location.search]);

  const noSectionTasks = useMemo(() => {
    return [
      ...(showCompletedTasks ? allTasks.completed : []),
      ...allTasks.incompleted,
    ].filter((task) => task.sectionId == null);
  }, [allTasks.completed, allTasks.incompleted, showCompletedTasks]);

  const completedTasks = useMemo(() => {
    if (!showCompletedTasks) return [];
    return allTasks.completed;
  }, [allTasks.completed, showCompletedTasks]);

  const incompletedTasks = useMemo(() => {
    return allTasks.incompleted;
  }, [allTasks.incompleted]);

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

  const handleCompleteTask = useCallback(
    (completedTask: Task) => {
      setAllTasks((prev) => {
        const next = completeTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          completedTask.id
        );
        updateTasks(currentUser.uid, next);
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
      setSelectedTasks(
        selectedTasks.filter(
          (selectedTask) => selectedTask.id !== completedTask.id
        )
      );
    },
    [currentUser.uid, sections, selectedTasks]
  );

  const handleIncompleteTask = useCallback(
    (incompletedTask: Task) => {
      setAllTasks((prev) => {
        const next = incompleteTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          incompletedTask.id
        );
        updateTasks(currentUser.uid, next);
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
    },
    [currentUser.uid, sections]
  );

  const handleCreateTask = useCallback(
    (createdTask: Task) => {
      setAllTasks((prev) => {
        const next = updateOrAddTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          createdTask
        );
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
      createTask(currentUser.uid, createdTask);
    },
    [currentUser.uid, sections]
  );

  const handleDeleteTask = useCallback(
    (deletedTask: Task) => {
      setAllTasks((prev) => {
        if (
          selectedTasks.length > 1 &&
          selectedTasks.some(
            (selectedTask) => selectedTask.id === deletedTask.id
          )
        ) {
          // 複数削除
          const deletedTaskIds = selectedTasks.map(
            (selectedTask) => selectedTask.id
          );
          const next = deleteTasksState(
            sections,
            [...prev.completed, ...prev.incompleted],
            deletedTaskIds
          );
          const batch = writeBatch(firestore);
          updateTasksBatch(batch, currentUser.uid, next);
          deleteTasksBatch(batch, currentUser.uid, projectId, deletedTaskIds);
          batch.commit();
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        } else {
          // 単一削除
          const next = deleteTaskState(
            sections,
            [...prev.completed, ...prev.incompleted],
            deletedTask.id
          );
          const batch = writeBatch(firestore);
          updateTasksBatch(batch, currentUser.uid, next);
          deleteTaskBatch(batch, currentUser.uid, projectId, deletedTask.id);
          batch.commit();
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        }
      });
    },
    [currentUser.uid, projectId, sections, selectedTasks]
  );

  const handleClickTask = useCallback(
    (clickedTask: Task) => {
      navigate(`?task=${clickedTask.id}`);
    },
    [navigate]
  );

  const handleUpdatedTask = useCallback(
    (updatedTask: Task) => {
      setAllTasks((prev) => {
        const next = updateOrAddTaskState(
          sections,
          [...prev.completed, ...prev.incompleted],
          updatedTask
        );
        const [completed, incompleted] = separateTasks(next);
        return { completed, incompleted };
      });
    },
    [sections]
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
      const range = getTasksByRange(
        sections,
        incompletedTasks,
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
    (result: DropResult) => {
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
        setAllTasks((prev) => {
          const next = moveTaskState(
            sections,
            [...prev.completed, ...prev.incompleted],
            taskId,
            toSectionId,
            toIndex
          );
          updateTasks(currentUser.uid, next);
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        });
      } else {
        // 複数移動
        const firstTaskId = taskId;
        const otherTaskIds = selectedTasks
          .filter((selectedTask) => selectedTask.id !== firstTaskId)
          .map((selectedTask) => selectedTask.id);
        setAllTasks((prev) => {
          const next = moveTasksState(
            sections,
            [...prev.completed, ...prev.incompleted],
            firstTaskId,
            otherTaskIds,
            toSectionId,
            toIndex
          );
          updateTasks(currentUser.uid, next);
          const [completed, incompleted] = separateTasks(next);
          return { completed, incompleted };
        });
      }
    },
    [currentUser.uid, sections, selectedTasks]
  );

  useEffect(() => {
    if (!project) {
      setIncompletedTasksLoaded(true);
      return;
    }
    const unsubscribe = listenIncompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setAllTasks((prev) => ({ ...prev, incompleted: tasks }));
        setIncompletedTasksLoaded(true);
      }
    );
    return unsubscribe;
  }, [currentUser.uid, project, projectId]);

  useEffect(() => {
    if (!project) {
      setCompletedTasksLoaded(true);
      return;
    }
    if (!showCompletedTasks) {
      setCompletedTasksLoaded(true);
      return;
    }
    const unsubscribe = listenCompletedTasks(
      currentUser.uid,
      projectId,
      (tasks) => {
        setAllTasks((prev) => ({ ...prev, completed: tasks }));
        setCompletedTasksLoaded(true);
      }
    );
    return unsubscribe;
  }, [currentUser.uid, project, projectId, showCompletedTasks]);

  /*
   * other
   */

  const headerHeight = 56;

  const loaded = useMemo(() => {
    return (
      projectInitialized &&
      sectionsInitialized &&
      incompletedTasksLoaded &&
      completedTasksLoaded
    );
  }, [
    completedTasksLoaded,
    incompletedTasksLoaded,
    projectInitialized,
    sectionsInitialized,
  ]);

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
          <TaskModalCard
            userId={currentUser.uid}
            projectId={projectId}
            taskId={showingTaskId}
            open={Boolean(showingTaskId)}
            onUpdated={handleUpdatedTask}
            onClose={handleCloseTaskModal}
          />

          {/* project header */}
          <Container maxWidth="lg">
            <Field
              sx={{
                alignItems: "center",
                backgroundColor: "white",
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
          <Container maxWidth="lg" sx={{ flexGrow: 1, overflowY: "auto" }}>
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
                    tasks={noSectionTasks}
                    selectedTasks={selectedTasks}
                    onCompleteTask={handleCompleteTask}
                    onIncompleteTask={handleIncompleteTask}
                    onCreateTask={handleCreateTask}
                    onDeleteTask={handleDeleteTask}
                    onClickTask={handleClickTask}
                    onSelectTask={handleSelectTask}
                    onMultiSelectTask={handleMultiSelectTask}
                  />
                </Box>
                <SectionList
                  projectId={projectId}
                  sections={sections}
                  tasks={[...completedTasks, ...incompletedTasks]}
                  selectedTasks={selectedTasks}
                  onCompleteTask={handleCompleteTask}
                  onIncompleteTask={handleIncompleteTask}
                  onCreateTask={handleCreateTask}
                  onDeleteTask={handleDeleteTask}
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
