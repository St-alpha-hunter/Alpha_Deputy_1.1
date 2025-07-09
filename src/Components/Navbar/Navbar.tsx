import logo2 from "./logo1.png";
import { Link } from "react-router-dom";

interface Props {}

const Navbar = (props: Props) => {
  return (
    <nav className="relative container mx-auto p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-20">
                <Link to = "/">
                  <img src={logo2} alt="" />
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
          <div className="lg:flex items-center space-x-6 text-black">
            <div className="hover:text-darkBlue">Login</div>
              <a
                href=""
                className="px-8 py-3 font-bold rounded text-black bg-lightGreen hover:opacity-70"
              >
                Signup
              </a>
          </div>
        </div>
    </nav>
  );
};

export default Navbar