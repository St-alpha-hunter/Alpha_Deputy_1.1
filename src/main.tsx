import ReactDOM , {createRoot} from  'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import { RouterProvider } from "react-router-dom";
import { router} from "./Routes/Routes";
import { Provider } from 'react-redux'; 
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import store from './redux/features/store';
import './i18n';

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  root.render(
    <StrictMode>
      <Provider store={store}> 
          <DndProvider backend={HTML5Backend}>
              <RouterProvider  router = { router } />
          </DndProvider>
      </Provider>
    </StrictMode>
  );
