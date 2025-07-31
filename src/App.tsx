import './App.css';
import "../src/Components/Card/Card.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from './Components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './Context/useAuth';


function App() {

  return (
          <>
            <UserProvider>
                <Toaster position="top-center" />
                  <Navbar/>
                  <Outlet/>
                <ToastContainer/>
            </UserProvider>
          </>
      );
    }
export default App;