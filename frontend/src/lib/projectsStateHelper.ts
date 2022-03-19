import { Project } from "@/models/project";

export class ProjectsStateHelper {
  public static create(prev: Project[], project: Project): Project[] {
    return this._addOrUpdate(prev, project);
  }

  public static update(prev: Project[], project: Project): Project[] {
    return this._update(prev, project);
  }

  public static delete(prev: Project[], projectId: string): Project[] {
    return this._delete(prev, projectId);
  }

  private static _update(prev: Project[], project: Project): Project[] {
    return prev.map((prevProject) => {
      if (prevProject.id !== project.id) {
        return prevProject;
      }
      return project;
    });
  }

  private static _addOrUpdate(prev: Project[], project: Project): Project[] {
    if (!prev.some((prevProject) => prevProject.id === project.id)) {
      return [...prev, project];
    }

    return prev.map((prevProject) => {
      if (prevProject.id !== project.id) {
        return prevProject;
      }
      return project;
    });
  }

  private static _delete(prev: Project[], projectId: string): Project[] {
    return prev.filter((prevProject) => prevProject.id !== projectId);
  }
}
