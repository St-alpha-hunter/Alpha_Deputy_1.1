import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/features/store";

const TaskFloatingPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const tasks = useSelector((state: RootState) => state.taskId.tasks);

  const runningCount = tasks.filter(
    (t) => t.status === "QUEUED" || t.status === "RUNNING"
  ).length;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 9999,
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "12px 16px",
          background: "#111827",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        回测任务 {runningCount > 0 ? `(${runningCount})` : ""}
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            width: 320,
            maxHeight: 400,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12 }}>后台回测任务</div>

          {tasks.length === 0 ? (
            <div style={{ color: "#666" }}>当前没有任务</div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.taskId}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 0",
                }}
              >
                <div style={{ fontSize: 13, color: "#333", marginBottom: 6 }}>
                  {task.taskId}
                </div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  状态：<strong>{task.status}</strong>
                </div>
                <button
                  onClick={() => navigate(`/backtests/${task.taskId}`)}
                  style={{
                    border: "1px solid #ccc",
                    background: "#f9fafb",
                    padding: "6px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  查看详情
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFloatingPanel;