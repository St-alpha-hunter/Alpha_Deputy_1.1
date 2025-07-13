import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";

type Props = {}

const CodeFactor = (props: Props) => {
  return (


    <div className = "flex flex-col">
        <h1 className = "block font-semibold text-2xl text-center mb-[20px] text-black">Inventing Your Factor</h1>
            <form className = "flex flex-col text-center border-8 border-lightGreen rounded-2xl m-[200px] mt-[20px]" action="/submit" method="post">

                <div className = "flex flex-row justify-start gap-4">
                        <div className="flex flex-row h-[50px] m-4 w-1/2 gap-4">
                            <label className="block text-xl">
                                Name 
                            </label>
                            <input className="block w-full h-full border-2 rounded-lg border-lightGreen" type="text" name="name" />
                    
                        </div>
                        <div className="flex flex-row h-[50px] m-4 w-1/2 gap-4">
                            <label className="block text-xl">
                                Category 
                            </label>
                            <input  className="block w-full h-full border-2 rounded-lg border-lightGreen" type="text" name="category" />
                        </div>
                </div>

                <div className="h-[150px] m-4 flex flex-col justify-start">
                        <label className="block text-xl text-left">
                            Description
                        </label>
                        <input className="block w-full h-full border-2 rounded-lg border-lightGreen" type="text" name="description" />
                </div>

                <div className="h-[250px] m-4 flex flex-col justify-start">       
                        <label className="block text-xl text-left">
                            Code 
                        </label>
                        <input className="block w-full h-full border-2 rounded-lg border-lightGreen" type="text" name="code" />
                </div> 

                <button className="w-full h-[50px] bg-lightGreen text-black rounded-lg" type="submit"> 
                    Confirm My Factor 
                </button>
            </form>
    </div>
  )
}

export default CodeFactor;