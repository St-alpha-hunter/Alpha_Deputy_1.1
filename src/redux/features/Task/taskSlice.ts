// import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// interface TaskIdState {
//   taskId: string;
// }

// const initialTaskIdState: TaskIdState = {
//   taskId: "",
// };

// const taskIdSlice = createSlice({
//   name: "taskId",
//   initialState: initialTaskIdState,
//   reducers: {
//     setTaskId(state, action: PayloadAction<string>) {
//       state.taskId = action.payload;
//     },
//   },
// });

// export const { setTaskId } = taskIdSlice.actions;
// export default taskIdSlice.reducer;
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TaskStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface BacktestTaskItem {
  taskId: string;
  status: TaskStatus;
}

interface TaskState {
  currentTaskId: string | null;
  tasks: BacktestTaskItem[];
}

const initialState: TaskState = {
  currentTaskId: null,
  tasks: [],
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setCurrentTaskId(state, action: PayloadAction<string | null>) {
      state.currentTaskId = action.payload;
    },

    addTask(state, action: PayloadAction<BacktestTaskItem>) {
      const exists = state.tasks.find((t) => t.taskId === action.payload.taskId);
      if (!exists) {
        state.tasks.push(action.payload);
      }
    },

    updateTaskStatus(
      state,
      action: PayloadAction<{ taskId: string; status: TaskStatus }>
    ) {
      const task = state.tasks.find((t) => t.taskId === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
      }
    },

    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.taskId !== action.payload);
      if (state.currentTaskId === action.payload) {
        state.currentTaskId = null;
      }
    },

    clearTasks(state) {
      state.currentTaskId = null;
      state.tasks = [];
    },
  },
});

export const {
  setCurrentTaskId,
  addTask,
  updateTaskStatus,
  removeTask,
  clearTasks,
} = taskSlice.actions;

export default taskSlice.reducer;