import Grid from "@mui/material/Grid";
import React from "react";
import ProjectCard from "@/components/model/project/ProjectCard";
import { Project } from "@/models/project";

export type ProjectCardListProps = {
  projects: Project[];

  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
};

const ProjectCardList: React.VFC<ProjectCardListProps> = React.memo((props) => {
  const { projects, onEditProject, onDeleteProject } = props;

  return (
    <Grid container spacing={2}>
      {projects.map((project) => (
        <Grid key={project.id} item xs={12} sm={6}>
          <ProjectCard
            project={project}
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
