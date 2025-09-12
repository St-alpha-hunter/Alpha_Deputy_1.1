import { useEffect, useState } from "react";
import type { ReportGet } from "../../Models/Report";
import AnalysisList from "../../Components/AnalysisList/AnalysisList";
import axios from "axios";
import { handleError } from "../../Helpers/ErrorHandler"
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";
import { getReport } from "../../Service/ReportService";
import { useParams } from "react-router-dom";



const AnalysisPage = () => {
  const [report, setReport] = useState<ReportGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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


  return (
    <div className = "grid grid-cols-12 h-screen relative">
      <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg z-40">
        <FactorSidebar />
      </div>
      <div className="col-span-11 ml-[280px] border-2 border-gray-300 space-y-4 p-4">
        {loading && <div>Loading...</div>}
          {report && report.map(report => (
            <AnalysisList
              key={report.id}
              id={report.id}
              title={report.title}
              author={report.appUserId}
            />
          ))}
      </div>
    </div>
  )
}

export default AnalysisPage