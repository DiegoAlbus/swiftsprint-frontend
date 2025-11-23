'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Task, User } from '@/lib/api';
import SortableTaskCard from './SortableTaskCard';

interface Props {
  column: Column;
  tasks: Task[];
  users: User[];
  projectId: number;
  onUpdate: () => void;
  onDelete?: () => void;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanColumn({ column, tasks, users, projectId, onUpdate, onDelete, onTaskClick }: Props) {
  const { setNodeRef } = useDroppable({ id: `column-${column.id}` });

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{column.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{tasks.length}</span>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
          <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {sortedTasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                projectId={projectId}
                onUpdate={onUpdate}
                onClick={onTaskClick ? () => onTaskClick(task) : undefined}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

