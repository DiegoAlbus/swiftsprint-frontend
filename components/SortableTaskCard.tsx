'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/api';
import TaskCard from './TaskCard';

interface Props {
  task: Task;
  projectId: number;
  onUpdate: () => void;
  onClick?: () => void;
}

export default function SortableTaskCard({ task, projectId, onUpdate, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} projectId={projectId} onUpdate={onUpdate} onClick={onClick} />
    </div>
  );
}

