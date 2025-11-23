"use client";

import { Column, Task, User, columnAPI, taskAPI, ProjectMember } from "@/lib/api";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";

interface Props {
  projectId: number;
  columns: Column[];
  tasks: Task[];
  users: User[];
  onUpdate: () => void;
  isOwner?: boolean;
  userRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null;
  currentUser?: User | null;
  projectMembers?: ProjectMember[];
  projectOwnerId?: number;
}

export default function KanbanBoard({
  projectId,
  columns,
  tasks,
  users,
  onUpdate,
  isOwner = false,
  userRole = null,
  currentUser = null,
  projectMembers = [],
  projectOwnerId,
}: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overId = over.id;
    let targetColumnId: number;
    let position = 0;

    if (typeof overId === "string" && overId.startsWith("column-")) {
      targetColumnId = parseInt(overId.replace("column-", ""));
      const columnTasks = tasks.filter((t) => t.columnId === targetColumnId);
      position = columnTasks.length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetColumnId = overTask.columnId;
      position = overTask.position;
    }

    if (task.columnId === targetColumnId && task.position === position) return;

    try {
      await taskAPI.move(projectId, taskId, { targetColumnId, position });
      onUpdate();
    } catch (err) {
      console.error("Failed to move task", err);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm("Do you really want to delete this column?")) return;
    try {
      await columnAPI.delete(projectId, columnId);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete column");
    }
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-3 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.columnId === column.id)}
              users={users}
              projectId={projectId}
              onUpdate={onUpdate}
              onDelete={
                isOwner ? () => handleDeleteColumn(column.id) : undefined
              }
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={onUpdate}
          userRole={userRole}
          currentUser={currentUser}
          projectMembers={projectMembers}
          projectOwnerId={projectOwnerId}
        />
      )}
    </div>
  );
}
