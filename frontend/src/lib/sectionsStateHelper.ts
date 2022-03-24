import { Section } from "@/models/section";
import { arrayMove } from "@/lib/arrayUtils";

export class SectionsStateHelper {
  public static create(prev: Section[], section: Section): Section[] {
    return this._addOrUpdate(prev, section);
  }

  public static update(prev: Section[], section: Section): Section[] {
    return this._update(prev, section);
  }

  public static move(
    prev: Section[],
    sectionId: string,
    toIndex: number
  ): Section[] {
    const section = prev.find((prevSection) => prevSection.id === sectionId);
    if (!section) return prev;
    const toSection = prev[toIndex];
    if (!toSection) return prev;
    return this._index(
      arrayMove(this._sort(prev), section.index, toSection.index)
    );
  }

  public static delete(prev: Section[], sectionId: string): Section[] {
    return this._index(
      prev.filter((prevSection) => prevSection.id !== sectionId)
    );
  }

  /*
   * private
   */

  private static _addOrUpdate(prev: Section[], section: Section): Section[] {
    if (prev.some((prevSection) => prevSection.id === section.id)) {
      return this._update(prev, section);
    } else {
      return this._sort([...prev, section]);
    }
  }

  private static _update(prev: Section[], section: Section): Section[] {
    return this._sort(
      prev.map((prevSection) => {
        if (prevSection.id === section.id) {
          return section;
        } else {
          return prevSection;
        }
      })
    );
  }

  private static _sort(prev: Section[]): Section[] {
    return prev.concat().sort((a, b) => a.index - b.index);
  }

  private static _index(prev: Section[]): Section[] {
    return prev.map((prevSection, i) => ({ ...prevSection, index: i }));
  }
}
