import ReactDOM , {createRoot} from  'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import { RouterProvider } from "react-router-dom";
import { router} from "./Routes/Routes";


  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  root.render(
    <StrictMode>
      <RouterProvider  router = { router } />
    </StrictMode>,
  )
