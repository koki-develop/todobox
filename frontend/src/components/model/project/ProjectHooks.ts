import { useRecoilValue } from "recoil";
import { projectsInitializedState, projectsState } from "@/atoms/projectAtoms";

export const useProjects = () => {
  const initialized = useRecoilValue(projectsInitializedState);
  const projects = useRecoilValue(projectsState);

  return {
    initialized,
    projects,
  };
};
