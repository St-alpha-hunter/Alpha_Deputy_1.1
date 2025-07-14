import type { SyntheticEvent } from "react";
import Factor, { type FactorProps } from "../Factor/Factor";

interface Props {
    selectedFactors: FactorProps[];
    displayfactors:(factor: { id: string; name?: string }) => void;
}

const Display = ( { selectedFactors, displayfactors}: Props) => {
    return (
        <div>
            {selectedFactors.map((factor) => (
                    <Factor 
                        key={factor.id} 
                        {...factor}
                        CheckingFactor={displayfactors}
                        />
                ))}
        </div>
  )
}

export default Display;