import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { sectionsInitializedState, sectionsState } from "@/atoms/sectionAtoms";
import {
  CreateSectionInput,
  Section,
  UpdateSectionInput,
} from "@/models/section";
import { SectionsRepository } from "@/lib/sectionsRepository";
import { SectionsStateHelper } from "@/lib/sectionsStateHelper";
import { useCurrentUser } from "./userHooks";

export const useSections = () => {
  const { currentUser } = useCurrentUser();

  const sectionsInitialized = useRecoilValue(sectionsInitializedState);
  const [sections, setSections] = useRecoilState(sectionsState);

  const createSection = useCallback(
    async (projectId: string, input: CreateSectionInput) => {
      if (!currentUser) return;

      const newSection = SectionsRepository.build(input);

      setSections((prev) => SectionsStateHelper.create(prev, newSection));
      await SectionsRepository.create(currentUser.uid, projectId, newSection);
    },
    [currentUser, setSections]
  );

  const updateSection = useCallback(
    async (projectId: string, section: Section, input: UpdateSectionInput) => {
      if (!currentUser) return;

      const updatedSection = { ...section, ...input };
      setSections((prev) => SectionsStateHelper.update(prev, updatedSection));
      await SectionsRepository.update(
        currentUser.uid,
        projectId,
        section.id,
        input
      );
    },
    [currentUser, setSections]
  );

  const moveSection = useCallback(
    async (projectId: string, sectionId: string, toIndex: number) => {
      if (!currentUser) return;

      setSections((prev) => {
        const next = SectionsStateHelper.move(prev, sectionId, toIndex);
        const updateInputs = next.reduce<{ [id: string]: UpdateSectionInput }>(
          (result, current) => {
            const { id, index } = current;
            result[id] = { index };
            return result;
          },
          {}
        );
        SectionsRepository.updateSections(
          currentUser.uid,
          projectId,
          updateInputs
        );
        return next;
      });
    },
    [currentUser, setSections]
  );

  const deleteSection = useCallback(
    async (projectId: string, sectionId: string) => {
      if (!currentUser) return;

      setSections((prev) => {
        const next = SectionsStateHelper.delete(prev, sectionId);
        const batch = SectionsRepository.writeBatch();
        const updateInputs = next.reduce<{ [id: string]: UpdateSectionInput }>(
          (result, current) => {
            const { id, index } = current;
            result[id] = { index };
            return result;
          },
          {}
        );
        SectionsRepository.updateSectionsBatch(
          batch,
          currentUser.uid,
          projectId,
          updateInputs
        );
        SectionsRepository.deleteBatch(
          batch,
          currentUser.uid,
          projectId,
          sectionId
        );
        SectionsRepository.commitBatch(batch);
        return next;
      });
    },
    [currentUser, setSections]
  );

  return {
    sectionsInitialized,
    sections,
    createSection,
    updateSection,
    deleteSection,
    moveSection,
  };
};
