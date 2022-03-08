import Grid from "@mui/material/Grid";
import React, { useCallback, useState } from "react";
import ProjectCard from "@/components/model/project/ProjectCard";
import { Project } from "@/models/project";

export type ProjectCardListProps = {
  projects: Project[];

  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
};

const ProjectCardList: React.VFC<ProjectCardListProps> = React.memo((props) => {
  const { projects, onEditProject, onDeleteProject } = props;

  const [menuOpenProjectId, setMenuOpenProjectId] = useState<string | null>(
    null
  );

  const handleOpenProjectMenu = useCallback((project: Project) => {
    setMenuOpenProjectId((prev) => (prev === project.id ? null : project.id));
  }, []);

  const handleCloseProjectMenu = useCallback((project: Project) => {
    setMenuOpenProjectId((prev) => (prev === project.id ? null : prev));
  }, []);

  return (
    <Grid container spacing={2}>
      {projects.map((project) => (
        <Grid key={project.id} item xs={12} sm={6}>
          <ProjectCard
            openMenu={project.id === menuOpenProjectId}
            project={project}
            onOpenMenu={handleOpenProjectMenu}
            onCloseMenu={handleCloseProjectMenu}
            onEdit={onEditProject}
            onDelete={onDeleteProject}
          />
        </Grid>
      ))}
    </Grid>
  );
});

ProjectCardList.displayName = "ProjectCardList";

export default ProjectCardList;
