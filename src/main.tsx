import ReactDOM , {createRoot} from  'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import { RouterProvider } from "react-router-dom";
import { router} from "./Routes/Routes";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  root.render(
    <StrictMode>
        <DndProvider backend={HTML5Backend}>
            <RouterProvider  router = { router } />
        </DndProvider>
    </StrictMode>
  );
