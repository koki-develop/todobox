import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import React from "react";
import ProjectListItem from "@/components/model/project/ProjectListItem";
import { Project } from "@/models/project";

export type ProjectListProps = {
  projects: Project[];

  onDeleteProject: (project: Project) => void;
};

const ProjectList: React.VFC<ProjectListProps> = React.memo((props) => {
  const { projects, onDeleteProject } = props;

  return (
    <Paper>
      <List disablePadding>
        {projects.map((project) => (
          <React.Fragment key={project.id}>
            <ProjectListItem project={project} onDelete={onDeleteProject} />
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
});

ProjectList.displayName = "ProjectList";

export default ProjectList;
