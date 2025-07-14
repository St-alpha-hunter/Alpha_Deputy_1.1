import { useState } from "react";
//import { useNavigate } from "react-router";
import { toast } from "react-toastify";


interface Props {}

const CodingFactor = (props: Props) => {
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [code, setCode] = useState('')

   // const [createFactor] = useCreateFactor()
   // const {data: categories} = useFetchCategoriesQuery() 

    const HandlerSubmit = async (e) => {
        e.preventDefault();
        if (!name || !description || !code || !category){
            toast.error("Please fill in all required fileds");
            return;
        }

        try {
            const codingFactor = new FormData()
            codingFactor.append('Name', name)
            codingFactor.append('Category', category)
            codingFactor.append('Description', description)
            codingFactor.append('Code', code)

        //const { data } = await createProduct(productData);
        //if (data.error) {
        //toast.error("Product create failed. Try Again.");
        //} else {
        // toast.success(`${data.name} is created`);
        //navigate("/admin/productlist");
        //}

        } catch(error) {
            toast.error("Product create failed. Try again.");
        }
    }




  return (
        <div className = "flex flex-col">
        <h1 className = "block font-semibold text-2xl text-center mb-[20px] text-black">Inventing Your Factor</h1>
            <form className = "flex flex-col text-center border-8 border-lightGreen rounded-2xl m-[200px] mt-[20px]" action="/submit" method="post">

                <div className = "flex flex-row justify-start gap-4">
                        <div className="flex flex-row h-[50px] m-4 w-1/2 gap-4">
                            <label className="block text-xl">
                                Name 
                            </label>
                            <input 
                                className="block w-full h-full border-2 rounded-lg border-lightGreen" 
                                type="text" 
                                name="name" 
                                value={name}
                                onChange = { e => setName(e.target.value)}
                                />
                    
                        </div>
                        <div className="flex flex-row h-[50px] m-4 w-1/2 gap-4">
                            <label className="block text-xl">
                                Category 
                            </label>
                            <input  
                                className="block w-full h-full border-2 rounded-lg border-lightGreen" 
                                type="text" 
                                name="category"
                                value={category}
                                onChange = {e => setCategory(e.target.value)} 
                                />
                        </div>
                </div>

                <div className="h-[150px] m-4 flex flex-col justify-start">
                        <label className="block text-xl text-left">
                            Description
                        </label>
                        <input 
                            className="block w-full h-full border-2 rounded-lg border-lightGreen" 
                            type="text" 
                            name="description" 
                            value={description}
                            onChange = {e => setDescription(e.target.value)}
                            />
                </div>

                <div className="h-[250px] m-4 flex flex-col justify-start">       
                        <label className="block text-xl text-left">
                            Code 
                        </label>
                        <input 
                            className="block w-full h-full border-2 rounded-lg border-lightGreen" 
                            type="text" 
                            name="code" 
                            value={code}
                            onChange = {e => setCode(e.target.value)}
                            />
                </div> 

                <button 
                    className="w-full h-[50px] bg-lightGreen text-black rounded-lg" 
                    onClick = {HandlerSubmit}
                    type="submit"> 
                    Confirm My Factor 
                </button>
            </form>
    </div>
  )
}

export default CodingFactor