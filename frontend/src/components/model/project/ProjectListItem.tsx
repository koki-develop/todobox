import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Project } from "@/models/project";

export type ProjectListItemProps = {
  project: Project;

  onDelete: (project: Project) => void;
};

const ProjectListItem: React.VFC<ProjectListItemProps> = React.memo((props) => {
  const { project, onDelete } = props;

  const handleDelete = useCallback(() => {
    onDelete(project);
  }, [onDelete, project]);

  return (
    <li>
      <span>
        <Link to={`/projects/${project.id}`}>{project.name}</Link>
      </span>
      <span>
        <button onClick={handleDelete}>delete</button>
      </span>
    </li>
  );
});

ProjectListItem.displayName = "ProjectListItem";

export default ProjectListItem;
