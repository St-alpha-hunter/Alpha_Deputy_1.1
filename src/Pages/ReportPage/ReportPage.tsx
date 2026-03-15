import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar"
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteReport, getReportById } from "../../Service/ReportService";
import type { ReportGet } from "../../Models/Report";
import type { BacktestResult } from "../../Service/NewBacktestService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ReportPage = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const [report, setReport] = useState<ReportGet | null>(null);

    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchReport = async () => {
            if (reportId) {
                const data = await getReportById(reportId);
                if (data) {
                    setReport(data);
    ///别在useEffect里直接console.log(report)，因为setReport是异步的，数据还没更新就打印了旧值
    ///别在useEffect里面display，display依赖report，report更新了display才会更新，所以在useEffect里直接打印display也是旧值
                } else {
                    setReport(null);
                }
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


    const DeleteReport = async (e: React.FormEvent) => {
        e.preventDefault();
        // 这里调用删除报告的 API，例如：
        try{
            await deleteReport(reportId!);
            toast.success("报告删除成功");
            setReport(null); // 删除后清空当前报告数据
            navigate("/report"); // 删除后导航回分析列表页
        }
        catch(error){
            console.error("删除报告失败:", error);
        }
    }



  return (
    <div className="grid grid-cols-12 h-screen relative">
      <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg">
        <FactorSidebar />
      </div>

      <div className="col-span-10 col-start-3 p-6">
        <h2 className="font-bold text-black text-2xl mb-4">回测报告</h2>

        {report && display ? (
          <div className="space-y-4">
            <div>
              <div className="font-semibold">策略名称</div>
              <div>{report.strategyName}</div>
            </div>

            <div>
              <div className="font-semibold">是否成功</div>
              <div>{display.success ? "是" : "否"}</div>
            </div>

            <div>
              <div className="font-semibold">Sharpe</div>
              <div>{display.metrics["sharpe 夏普比率"].sharperatio}</div>
            </div>

            <div>
              <div className="font-semibold">累计收益率</div>
              <div>{display.metrics["returns 累计收益率"].rtot}</div>
            </div>

            <div>
              <div className="font-semibold">最大回撤</div>
              <div>{display.metrics["maxDrawdown 最大回撤"].drawdown}</div>
            </div>

            <div>
              <div className="font-semibold">原始结果 JSON</div>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {display ? JSON.stringify(display, null, 2) : "暂无结果"}
                </pre>
            </div>

            <form onSubmit = {DeleteReport}>
                <div>
                    <button type="submit" className="bg-red-500 text-white font-bold rounded-lg w-80 h-20 border-b border-white pb-4 mb-8 ">
                        删除报告
                    </button>
                </div>
            </form>
          </div>
        ) : (
          <div>暂无结果</div>
        )}
      </div>
    </div>
  );
    
}

export default ReportPage;