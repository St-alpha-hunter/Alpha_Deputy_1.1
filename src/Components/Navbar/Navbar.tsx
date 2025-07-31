import { useAuth } from "../../Context/useAuth";
import logo from "./logo.png";
import { Link } from "react-router-dom";

interface Props {}

const Navbar = (props: Props) => {
  const { isLoggedIn, user, logout } = useAuth();
  return (
    <nav className="relative container mx-auto p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-20">
                <Link to = "/">
                  <img src={logo} alt="" />
                </Link>


                <div className=" font-bold lg:flex">
                  <Link to ="/search" className="text-black hover:text-darkBlue">
                          Search Stock
                  </Link>
                </div>

                <div className=" font-bold lg:flex">
                  <Link to ="/deck" className="text-black hover:text-darkBlue">
                          FactorDeck
                  </Link>
                </div>

                <div className=" font-bold lg:flex">
                  <Link to ="/session" className="text-black hover:text-darkBlue">
                         Session
                  </Link>
                </div>

                <div className=" font-bold lg:flex">
                  <Link to ="/report" className="text-black hover:text-darkBlue">
                         My Team's Reports
                  </Link>
                </div>
          </div>

        {isLoggedIn() ?(
          <div className="hidden lg:flex items-center space-x-6 text-back">
            <div className="hover:text-darkBlue">Welcome, {user?.userName}</div>
            <a
              onClick={logout}
              className="px-8 py-3 font-bold rounded text-white bg-lightGreen hover:opacity-70"
            >
              Logout
            </a>
          </div>
        ):(
          <div className="lg:flex items-center space-x-6 text-black">
            <Link to="/login" className="hover:text-darkBlue">
              Login
            </Link>
            
            <Link
                to="/register"
                className="px-8 py-3 font-bold rounded text-black bg-lightGreen hover:opacity-70"
              >
                Signup
              </Link>
          </div>
          )}
        </div>
    </nav>
  );
};

export default Navbar