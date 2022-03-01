import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import TaskList from "@/components/model/task/TaskList";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

export type SectionListProps = {
  sections: Section[];
  tasks: Task[];
};

const SectionList: React.VFC<SectionListProps> = React.memo((props) => {
  const { sections, tasks } = props;

  return (
    <Droppable droppableId="sections" type="sections">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {sections.map((section, i) => (
            <Draggable key={section.id} draggableId={section.id} index={i}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps}>
                  <div {...provided.dragHandleProps}>{section.name}</div>
                  <TaskList
                    sectionId={section.id}
                    tasks={tasks.filter(
                      (task) => task.sectionId === section.id
                    )}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
});

SectionList.displayName = "SectionList";

export default SectionList;
