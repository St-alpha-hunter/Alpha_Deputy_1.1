import './App.css';
import "../src/Components/Card/Card.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from './Components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from "react-toastify";


function App() {

  return (
          <>

             <Navbar/>
             <Outlet/>
             <ToastContainer/>

          </>
      );
    }
export default App;