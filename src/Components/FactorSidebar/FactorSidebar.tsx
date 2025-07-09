import { HiWrenchScrewdriver } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { HiServerStack } from "react-icons/hi2";

type Props = {}

const FactorSidebar = (props: Props) => {
  return (
        <nav className="block py-4 px-6 top-0 bottom-0 w-64 bg-white border-8 border-lightGreen shadow-xl left-0 absolute flex-row flex-nowrap md:z-10 z-9999 transition-all duration-300 ease-in-out transform md:translate-x-0 -translate-x-full">
            <div className="flex-col min-h-full px-0 flex flex-wrap items-center justify-between w-full mx-auto overflow-y-auto overflow-x-hidden">
                <div className="flex bg-white flex-col items-stretch opacity-100 relative mt-4 overflow-y-auto overflow-x-hidden h-auto z-40 items-center flex-1 rounded w-full">
                    <div className="md:flex-col md:min-w-full flex flex-col list-none">
                        <Link
                        to="experience"
                        className="flex md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline"
                        >
                        <HiWrenchScrewdriver />
                        <h6 className="ml-3">Code Factor</h6>
                        </Link>
                        <Link
                        to="strategy-warehouse"
                        className="flex md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline"
                        >
                        <HiServerStack />
                        <h6 className="ml-3">Strategy Warehouse</h6>
                        </Link>
                    </div>
                </div>
            </div>
    </nav>
  )
}

export default FactorSidebar