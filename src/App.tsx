import './App.css';
import "../src/Components/Card/Card.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from './Components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { Toaster } from 'react-hot-toast';

function App() {

  return (
          <>
             <Toaster position="top-center" />
             <Navbar/>
             <Outlet/>
             <ToastContainer/>

          </>
      );
    }
export default App;