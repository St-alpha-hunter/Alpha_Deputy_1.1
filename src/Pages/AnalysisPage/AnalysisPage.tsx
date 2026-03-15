import { useEffect, useState } from "react";
import type { ReportGet } from "../../Models/Report";
import AnalysisList from "../../Components/AnalysisList/AnalysisList";
import axios from "axios";
import { handleError } from "../../Helpers/ErrorHandler"
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";
import { getReport, getReportById } from "../../Service/ReportService";
import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const AnalysisPage = () => {
  const [report, setReport] = useState<ReportGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

    useEffect(() => {
    const fetchReport = async (): Promise<void> => {
      setLoading(true);
      try {
        const data = await getReport();
        if (data) {
          setReport(data);
        } else {
          setReport(null);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const onClick =  (reportId: string) => {
    console.log("Clicked analysis with id:", reportId);
    const res = getReportById(reportId);
    // 这里可以添加导航到分析详情页的逻辑，例如：
    navigate(`/report/${reportId}`);
  }



  return (
    <div className = "grid grid-cols-12 h-screen relative">
      <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg z-40">
        <FactorSidebar />
      </div>
      <div className="col-span-11 ml-[280px] border-2 border-gray-900 space-y-4 p-4">
        {loading && <div>Loading...</div>}
          {report && report.map(report => (
            <AnalysisList
              id={report.reportId}
              title={report.strategyName}
              author={report.appUserId}
              onClick={() => onClick(report.reportId)}
            />
          ))}
      </div>
    </div>
  )
}

export default AnalysisPage