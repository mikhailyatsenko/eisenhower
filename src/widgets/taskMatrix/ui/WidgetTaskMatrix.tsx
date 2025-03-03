// import { DndContext, DragOverlay } from '@dnd-kit/core';
// import { useDragEvents } from '@/features/interactWithMatrix/lib/hooks/useDragEvents';
// import { Quadrant } from '@/entities/taskMatrix/ui/quadrant/Quadrant';

export const WidgetTaskMatrix = () => {
  // const dragEvents = useDragEvents({
  //   setDragOverQuadrant,
  //   setActiveTaskId,
  //   setIsDragging,
  //   tasks,
  //   dragEndAction,
  //   dragOverQuadrantAction,
  // });
  // return (
  //   <div className="relative flex w-full flex-wrap justify-center pt-6">
  //     {!(expandedQuadrant || taskInputText) && (
  //       <div className="absolute flex h-6 w-full -translate-y-full flex-nowrap">
  //         <div className="w-1/2 text-center">Urgent</div>
  //         <div className="w-1/2 text-center">Not Urgent</div>
  //       </div>
  //     )}
  //     {!(expandedQuadrant || taskInputText) && (
  //       <div className="absolute left-0 flex h-full w-6 -translate-x-full flex-col">
  //         <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
  //           Important
  //         </div>
  //         <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
  //           Not Important
  //         </div>
  //       </div>
  //     )}
  //     <DndContext
  //       sensors={sensors}
  //       collisionDetection={closestCenter}
  //       onDragStart={handleDragStart}
  //       onDragOver={handleDragOver}
  //       onDragEnd={handleDragEnd}
  //     >
  //       {Object.entries(MatrixQuadrants).map(([key]) => (
  //         <Quadrant
  //           tasks={tasks[key as MatrixKey]}
  //           isAnimateByExpandQuadrant={isAnimateByExpandQuadrant}
  //           handleToggleExpand={handleToggleExpand}
  //           expandedQuadrant={expandedQuadrant}
  //           key={key}
  //           quadrantKey={key as MatrixKey}
  //           isDragOver={dragOverQuadrant === key}
  //           orderIndex={quadrantOrder.indexOf(key)}
  //           isTypingNewTask={taskInputText.trim() !== ''}
  //         />
  //       ))}
  //       <DragOverlay dropAnimation={dropAnimation}>
  //         {activeTaskId ? (
  //           <TaskItem
  //             task={
  //               tasks[dragOverQuadrant as MatrixKey].find(
  //                 (t) => t.id === activeTaskId,
  //               ) as Task
  //             }
  //             quadrantKey={dragOverQuadrant as MatrixKey}
  //             index={0}
  //           />
  //         ) : null}
  //       </DragOverlay>
  //     </DndContext>
  //   </div>
  // );
};
