import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { sectionsInitializedState, sectionsState } from "@/atoms/sectionAtoms";
import { CreateSectionInput } from "@/models/section";
import { SectionsRepository, SectionsStateHelper } from "@/lib/sectionUtils";
import { useCurrentUser } from "./userHooks";

export const useSections = () => {
  const { currentUser } = useCurrentUser();

  const sectionsInitialized = useRecoilValue(sectionsInitializedState);
  const [sections, setSections] = useRecoilState(sectionsState);

  const createSection = useCallback(
    async (projectId: string, input: CreateSectionInput) => {
      if (!currentUser) return;
      const newSection = SectionsRepository.build(input);
      setSections((prev) => {
        return SectionsStateHelper.create(prev, newSection);
      });
      await SectionsRepository.create(currentUser.uid, projectId, newSection);
    },
    [currentUser, setSections]
  );

  return {
    sectionsInitialized,
    sections,
    createSection,
  };
};
