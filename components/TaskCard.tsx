"use client";

import { formatComment } from "@/app/helpers/FormatHelper";
import { Task, taskAPI } from "@/lib/api";

interface Props {
  task: Task;
  projectId?: number;
  onUpdate?: () => void;
  isDragging?: boolean;
  onClick?: () => void;
}

const priorityColors = {
  LOW: "bg-gray-200 text-gray-700",
  MEDIUM: "bg-green-200 text-green-700",
  HIGH: "bg-orange-200 text-orange-700",
  URGENT: "bg-red-200 text-red-700",
};

export default function TaskCard({
  task,
  projectId,
  onUpdate,
  isDragging,
  onClick,
}: Props) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!projectId || !onUpdate) return;
    if (!confirm("Delete this task?")) return;
    try {
      await taskAPI.delete(projectId, task.id);
      onUpdate();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-3 rounded shadow hover:shadow-md transition ${
        onClick ? "cursor-pointer" : "cursor-move"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg line-clamp-2">{task.title}</h4>
        {projectId && onUpdate && (
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-xs flex-shrink-0 ml-2"
          >
            ✕
          </button>
        )}
      </div>
      {task.description && (
        <div
          className="text-gray-600 mb-4"
          dangerouslySetInnerHTML={{
            __html: task.description
              ? formatComment(
                  task.description.length > 100
                    ? task.description.slice(0, 100) + "..."
                    : task.description
                )
              : "No description",
          }}
        />
      )}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
        {
          <span className="text-xs text-gray-500 truncate">
            {task.assignee ? task.assignee.name : "Unassigned"}
          </span>
        }
      </div>
    </div>
  );
}
