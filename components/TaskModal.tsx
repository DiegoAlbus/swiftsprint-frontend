"use client";

import { Column, Tag, tagAPI, taskAPI, User } from "@/lib/api";
import { useState } from "react";

interface Props {
  projectId: number;
  columnId: number;
  columns?: Column[];
  users: User[];
  position?: number;
  onClose: () => void;
  onSuccess: () => void;
  onColumnChange?: (columnId: number) => void;
}

export default function TaskModal({
  projectId,
  columnId,
  columns,
  users,
  position = 0,
  onClose,
  onSuccess,
  onColumnChange,
}: Props) {
  const [selectedColumnId, setSelectedColumnId] = useState(columnId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await taskAPI.create(projectId, {
        title,
        description,
        columnId: selectedColumnId,
        assigneeId,
        priority,
        position,
      });

      const taskId = response.data.id;
      for (const tag of tags) {
        await tagAPI.create(taskId, { name: tag.name, color: tag.color });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: Date.now(),
      taskId: 0,
      name: newTagName.trim(),
      color: newTagColor,
      createdAt: new Date().toISOString(),
    };

    setTags([...tags, newTag]);
    setNewTagName("");
    setNewTagColor("#3B82F6");
    setShowAddTag(false);
  };

  const handleDeleteTag = (tagId: number) => {
    setTags(tags.filter((t) => t.id !== tagId));
  };

  const applyFormatting = (format: string) => {
    const textarea = document.getElementById(
      "description-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = description;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = "";
    if (format === "bold") {
      newText = `${before}**${selection}**${after}`;
    } else if (format === "italic") {
      newText = `${before}*${selection}*${after}`;
    } else if (format === "code") {
      newText = `${before}\`${selection}\`${after}`;
    } else if (format === "h1") {
      newText = `${before}# ${selection}${after}`;
    } else if (format === "h2") {
      newText = `${before}## ${selection}${after}`;
    }

    setDescription(newText);
    setTimeout(() => textarea.focus(), 0);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="mb-2 flex gap-2 border-b border-gray-200 pb-2">
              <button
                type="button"
                onClick={() => applyFormatting("bold")}
                className="px-2 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("italic")}
                className="px-2 py-1 text-sm italic border border-gray-300 rounded hover:bg-gray-100"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("code")}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                title="Code"
              >
                {"</>"}
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("h1")}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("h2")}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                title="Heading 2"
              >
                H2
              </button>
              <span className="text-xs text-gray-500 self-center ml-2">
                Supports **bold**, *italic*, `code`, # H1, ## H2
              </span>
            </div>
            <textarea
              id="description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description... (supports **bold**, *italic*, `code`, # H1, ## H2)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
            />
          </div>
          {columns && columns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Column
              </label>
              <select
                value={selectedColumnId}
                onChange={(e) => {
                  const newColumnId = parseInt(e.target.value);
                  setSelectedColumnId(newColumnId);
                  if (onColumnChange) {
                    onColumnChange(newColumnId);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              value={assigneeId || ""}
              onChange={(e) =>
                setAssigneeId(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {`${user?.name} (${user?.userIdentifier})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="ml-2 text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowAddTag(true)}
                className="px-3 py-1 border border-dashed border-gray-400 rounded-full text-sm text-gray-600 hover:bg-gray-50"
              >
                + Add Tag
              </button>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showAddTag && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Tag</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter tag name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddTag}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddTag(false);
                    setNewTagName("");
                    setNewTagColor("#3B82F6");
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
