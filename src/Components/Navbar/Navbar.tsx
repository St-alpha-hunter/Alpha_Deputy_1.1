import { useAuth } from "../../Context/useAuth";
import logo from "./logo.png";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next'
import i18n from 'i18next';

interface Props {}

const Navbar = (props: Props) => {
  const { isLoggedIn, user, logout } = useAuth();
  const { t } = useTranslation();
  return (
    <nav className="relative container mx-auto p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-20">
                <Link to = "/">
                  <img src={logo} alt="" />
                </Link>


                <div className=" font-bold lg:flex">
                  <Link to ="/search" className="text-black hover:text-darkBlue">
                          {t('searchStock')}
                  </Link>
                </div>

                <div className=" font-bold lg:flex">
                  <Link to ="/deck" className="text-black hover:text-darkBlue">
                          {t('factorHouse')}
                  </Link>
                </div>

                <div className=" font-bold lg:flex">
                  <Link to ="/session" className="text-black hover:text-darkBlue">
                         {t('session')}
                  </Link>
                </div>

                <div className=" font-bold lg:flex">
                  <Link to ="/report" className="text-black hover:text-darkBlue">
                         {t('teamReport')}
                  </Link>
                </div>

                <div className = "flex flex-row gap-2 font-bold text-blue-500 lg:flex">
                  <button onClick={() => i18n.changeLanguage('zh')}>中文</button>
                  <button onClick={() => i18n.changeLanguage('en')}>EN</button>
                </div>
          </div>

        {isLoggedIn() ?(
          <div className="hidden lg:flex items-center space-x-6 text-back">
            <div className="hover:text-darkBlue">Welcome, {user?.userName}</div>
            <a
              onClick={logout}
              className="px-8 py-3 font-bold rounded text-white bg-lightGreen hover:opacity-70"
            >
              {t('logout')}
            </a>
          </div>
        ):(
          <div className="lg:flex items-center space-x-6 text-black">
            <Link to="/login" className="hover:text-darkBlue">
              {t('login')}
            </Link>
            
            <Link
                to="/register"
                className="px-8 py-3 font-bold rounded text-black bg-lightGreen hover:opacity-70"
              >
                {t('SignUp')}
              </Link>
          </div>
          )}
        </div>
    </nav>
  );
};

export default Navbar