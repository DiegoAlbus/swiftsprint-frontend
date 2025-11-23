"use client";

import Navbar from "@/components/Navbar";
import TaskDetailModal from "@/components/TaskDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { Task, taskAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadTasks();
  }, [user, router]);

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getMyTasks();
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    LOW: "bg-gray-200 text-gray-700",
    MEDIUM: "bg-green-200 text-green-700",
    HIGH: "bg-orange-200 text-orange-700",
    URGENT: "bg-red-200 text-red-700",
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Tasks</h1>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No tasks assigned to you yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    Project ID: {task.projectId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
        />
      )}
    </div>
  );
}
