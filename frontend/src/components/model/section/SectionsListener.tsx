import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { sectionsInitializedState, sectionsState } from "@/atoms/sectionAtoms";
import { SectionsRepository } from "@/lib/sectionUtils";
import { useCurrentUser } from "@/hooks/userHooks";

export type SectionsListenerProps = {
  projectId: string;
};

const SectionsListener: React.VFC<SectionsListenerProps> = React.memo(
  (props) => {
    const { projectId } = props;

    const { currentUser } = useCurrentUser();
    const setSections = useSetRecoilState(sectionsState);
    const setSectionsInitialized = useSetRecoilState(sectionsInitializedState);

    useEffect(() => {
      if (!currentUser) return;
      const unsubscribe = SectionsRepository.listenAll(
        currentUser.uid,
        projectId,
        (sections) => {
          setSections(sections);
          setSectionsInitialized(true);
        }
      );
      return () => {
        unsubscribe();
        setSectionsInitialized(false);
        setSections([]);
      };
    }, [currentUser, projectId, setSections, setSectionsInitialized]);

    return null;
  }
);

SectionsListener.displayName = "SectionsListener";

export default SectionsListener;
