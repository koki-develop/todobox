import Grid from "@mui/material/Grid";
import React from "react";
import ProjectCard from "@/components/model/project/ProjectCard";
import { Project } from "@/models/project";

export type ProjectCardListProps = {
  projects: Project[];

  onDeleteProject: (project: Project) => void;
};

const ProjectCardList: React.VFC<ProjectCardListProps> = React.memo((props) => {
  const { projects, onDeleteProject } = props;

  return (
    <Grid container spacing={2}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDeleteProject}
        />
      ))}
    </Grid>
  );
});

ProjectCardList.displayName = "ProjectCardList";

export default ProjectCardList;
