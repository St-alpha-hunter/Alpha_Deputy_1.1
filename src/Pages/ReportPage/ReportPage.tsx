import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { deleteReport, getReportById } from "../../Service/ReportService";
import type { ReportGet } from "../../Models/Report";
import type { BacktestResult } from "../../Service/NewBacktestService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import BacktestReportView, { Card, ReportLayout, Spinner } from "../../Components/BacktestReportView/BacktestReportView";


const ReportPage = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const [report, setReport] = useState<ReportGet | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchReport = async () => {
            if (reportId) {
                setLoading(true);
                const data = await getReportById(reportId);
                setReport(data ?? null);
    ///别在useEffect里直接console.log(report)，因为setReport是异步的，数据还没更新就打印了旧值
    ///别在useEffect里面display，display依赖report，report更新了display才会更新，所以在useEffect里直接打印display也是旧值
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    const display: BacktestResult | null = useMemo(() => {
        if (!report?.resultJson) return null;

        try {
        return JSON.parse(report.resultJson) as BacktestResult;
        } catch (error) {
        console.error("解析 report.resultJson 失败:", error);
        return null;
        }
    }, [report]);


    const DeleteReport = async () => {
        try{
            await deleteReport(reportId!);

            toast.success(t("report.deleted"));
            setReport(null); // 删除后清空当前报告数据
            navigate("/report"); // 删除后导航回分析列表页
        }
        catch(error){
            console.error("删除报告失败:", error);
        }
    }


    const deleteActions = confirmingDelete ? (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t("report.confirmDelete")}</span>
            <button onClick={DeleteReport} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                {t("report.confirm")}
            </button>
            <button onClick={() => setConfirmingDelete(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                {t("report.cancel")}
            </button>
        </div>
    ) : (
        <button
            onClick={() => setConfirmingDelete(true)}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50"
        >
            {t("report.delete")}
        </button>
    );


    const body = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-32">
                    <Spinner />
                </div>
            );
        }

        if (!report || !display) {
            return (
                <Card className="text-center py-16">
                    <div className="text-gray-500">{t("report.empty")}</div>
                    <Link to="/report" className="inline-block mt-4 text-blue-600 hover:underline">{t("report.backToReports")}</Link>
                </Card>
            );
        }

        return (
            <BacktestReportView
                result={display}
                title={report.strategyName || t("report.untitled")}
                backLink={{ to: "/report", label: t("report.backToList") }}
                actions={deleteActions}
            />
        );
    };


  return <ReportLayout>{body()}</ReportLayout>;

}

export default ReportPage;
