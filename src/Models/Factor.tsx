export type FactorGet = {
    id: string;
    name: string;
    code_key: string;
    category: string;
    description: string;
    computeCode: string;
}

export function mapFactorFromApi(f: any): FactorGet {
    return {
        id: f.Id ?? f.id,
        name: f.Name ?? f.name,
        code_key: f.CodeKey ?? f.code_key ?? f.codekey ?? f.codeKey ,
        category: f.Category ?? f.category,
        description: f.Description ?? f.description ?? "",
        computeCode: f.ComputeCode ?? f.computeCode ?? "",
    };
}