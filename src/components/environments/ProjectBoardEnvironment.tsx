"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import type { ProjectBoardAction } from "@/lib/assessment-types";

interface Task {
  id: string;
  title: string;
  description?: string;
  column: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
}

interface ProjectBoardEnvironmentProps {
  initialColumns?: string[];
  initialTasks?: Task[];
}

export interface ProjectBoardEnvironmentRef {
  executeAction: (action: ProjectBoardAction) => void;
  getState: () => { columns: string[]; tasks: Task[] };
}

export const ProjectBoardEnvironment = forwardRef<ProjectBoardEnvironmentRef, ProjectBoardEnvironmentProps>(
  function ProjectBoardEnvironment(
    { initialColumns = ["Backlog", "To Do", "In Progress", "Done"], initialTasks = [] },
    ref
  ) {
    const [columns, setColumns] = useState(initialColumns);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      executeAction: (action: ProjectBoardAction) => {
        switch (action.type) {
          case "createTask":
            if (action.title) {
              const newTask: Task = {
                id: Date.now().toString(),
                title: action.title,
                description: action.description,
                column: action.column || columns[0],
                assignee: action.assignee,
                dueDate: action.dueDate,
              };
              setTasks((prev) => [...prev, newTask]);
            }
            break;
          case "moveTask":
            if (action.taskId && action.column) {
              setTasks((prev) =>
                prev.map((t) => (t.id === action.taskId ? { ...t, column: action.column! } : t))
              );
            }
            break;
          case "editTask":
            if (action.taskId) {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === action.taskId
                    ? {
                        ...t,
                        title: action.title ?? t.title,
                        description: action.description ?? t.description,
                        assignee: action.assignee ?? t.assignee,
                        dueDate: action.dueDate ?? t.dueDate,
                      }
                    : t
                )
              );
            }
            break;
          case "createColumn":
            if (action.column && !columns.includes(action.column)) {
              setColumns((prev) => [...prev, action.column!]);
            }
            break;
        }
      },
      getState: () => ({ columns, tasks }),
    }));

    const handleDragStart = (taskId: string) => {
      setDraggedTask(taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (column: string) => {
      if (draggedTask) {
        setTasks((prev) => prev.map((t) => (t.id === draggedTask ? { ...t, column } : t)));
        setDraggedTask(null);
      }
    };

    const handleAddTask = (column: string) => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: "New task",
        column,
      };
      setTasks((prev) => [...prev, newTask]);
      setEditingTask(newTask.id);
    };

    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          padding: "16px",
          gap: "12px",
          overflowX: "auto",
        }}
      >
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.column === column);
          return (
            <div
              key={column}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column)}
              style={{
                flex: "0 0 280px",
                backgroundColor: "#18181b",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                maxHeight: "100%",
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #27272a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#e4e4e7" }}>
                  {column}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#52525b",
                    backgroundColor: "#27272a",
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "8px",
                }}
              >
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    style={{
                      backgroundColor: "#27272a",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "8px",
                      cursor: "grab",
                      opacity: draggedTask === task.id ? 0.5 : 1,
                    }}
                  >
                    {editingTask === task.id ? (
                      <input
                        autoFocus
                        value={task.title}
                        onChange={(e) =>
                          setTasks((prev) =>
                            prev.map((t) => (t.id === task.id ? { ...t, title: e.target.value } : t))
                          )
                        }
                        onBlur={() => setEditingTask(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingTask(null)}
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          border: "none",
                          fontSize: "13px",
                          color: "#fff",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingTask(task.id)}
                        style={{ fontSize: "13px", color: "#e4e4e7", marginBottom: "8px" }}
                      >
                        {task.title}
                      </div>
                    )}
                    {task.description && (
                      <div style={{ fontSize: "12px", color: "#71717a", marginBottom: "8px" }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {task.assignee && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            color: "#fff",
                          }}
                        >
                          {task.assignee[0].toUpperCase()}
                        </div>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: "11px", color: "#71717a" }}>📅 {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add task button */}
              <button
                onClick={() => handleAddTask(column)}
                style={{
                  margin: "8px",
                  padding: "8px",
                  backgroundColor: "transparent",
                  border: "1px dashed #27272a",
                  borderRadius: "6px",
                  color: "#52525b",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                + Add task
              </button>
            </div>
          );
        })}

        {/* Add column button */}
        <button
          onClick={() => {
            const name = prompt("Column name:");
            if (name && !columns.includes(name)) {
              setColumns([...columns, name]);
            }
          }}
          style={{
            flex: "0 0 280px",
            backgroundColor: "transparent",
            border: "1px dashed #27272a",
            borderRadius: "8px",
            color: "#52525b",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + Add column
        </button>
      </div>
    );
  }
);
