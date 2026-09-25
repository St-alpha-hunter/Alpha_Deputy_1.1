import { useTranslation } from "react-i18next";

// 因子名称/描述是后端原文，用原文当 key 去 factorText 里查；查不到就显示原文
// 不用 t()：原文里可能有 "." 会被 i18next 当成嵌套路径
export const useFactorTranslate = () => {
    const { i18n } = useTranslation();
    const factorText: Record<string, string> =
        i18n.getResourceBundle(i18n.language, "translation")?.factorText ?? {};
    return (s?: string) => (s ? factorText[s] ?? s : s);
};
