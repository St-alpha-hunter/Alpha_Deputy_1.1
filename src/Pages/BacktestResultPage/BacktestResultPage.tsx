import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";
import { getBacktestResult } from "../../Service/NewBacktestService";
import type {
  BacktestResult,
  BacktestResultResponse,
} from "../../Service/NewBacktestService";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addTask, updateTaskStatus } from "../../redux/features/Task/taskSlice";
import {saveBacktestTasksToLocalStorage} from "../../Utils/localStorage";
import { toast } from "react-toastify";
import {createReport} from "../../Service/ReportService";
import { useTranslation } from "react-i18next";
import BacktestReportView, { Card, ReportLayout, Spinner } from "../../Components/BacktestReportView/BacktestReportView";

const BacktestResultPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const dispatch = useDispatch();
  const { t } = useTranslation();
      useEffect(() => {
        if (taskId) {
          dispatch(addTask({ taskId, status: "QUEUED" }));
          saveBacktestTasksToLocalStorage([taskId]);
        }
      }, [taskId, dispatch]);

  const [status, setStatus] =useState<BacktestResultResponse["status"]>("PENDING");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResultJson, setRawResultJson] = useState<string>("");


  useEffect(() => {

    if (!taskId) {
      setStatus("FAILED");
      setError(t("backtestResult.missingTaskId"));
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const poll = async () => {
      try {
        const res = await getBacktestResult(taskId);
        const { status, errorMessage, resultJson } = res;

        if (stopped) return;

        setStatus(status);

        if (status === "SUCCEEDED") {
          try {
            const data: BacktestResult = JSON.parse(resultJson || "{}");
            setResult(data);
            setRawResultJson(resultJson || "");
            dispatch(updateTaskStatus({ taskId, status: "SUCCEEDED" }));
            setError(null);
            // 注意：这里不能读 result（setResult 是异步的，此时 result 仍是旧值 null，
            // 读 result.equityCurve 会抛错并被下面 catch 误判为“解析失败”）
          } catch (e) {
            console.error("解析 resultJson 失败:", e);
            setError(t("backtestResult.parseFailed"));
            setStatus("FAILED");
            dispatch(updateTaskStatus({ taskId, status: "FAILED" }));
          }
          return;
        }

        if (status === "FAILED") {
          setError(errorMessage || t("backtestResult.failed"));
          dispatch(updateTaskStatus({ taskId, status: "FAILED" }));
          return;
        }

        timer = setTimeout(poll, 2000);
      } catch (e) {
        console.error("轮询失败:", e);
        if (!stopped) {
          setStatus("FAILED");
          setError(t("backtestResult.pollFailed"));
        }
      }
    };

    poll();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [taskId]);



    // ---------- 保存为报告 ----------
    const username = useSelector((state: RootState) => state.username.userName);
    const [strategyName, setStrategyName] = useState("");
    const [saving, setSaving] = useState(false);
    const [savedReportId, setSavedReportId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault(); // 阻止页面刷新
            if (!result) {
              toast.error(t("backtestResult.saveFailed"));
              return;
            }
            if (!strategyName.trim()) {
              toast.error(t("backtestResult.nameRequired"));
              return;
            }

            setSaving(true);
            try {
              const res = await createReport({
                appUserId: username, // 这里换成真实用户ID
                strategyName: strategyName.trim(),
                resultJson: rawResultJson,
            });
            // createReport 出错时会自己 handleError 并返回 undefined，这里要当失败处理
            if (!res) {
              toast.error(t("backtestResult.saveFailed"));
              return;
            }
            console.log("提交成功:", res);
            toast.success(t("backtestResult.saveSucceeded"));
            setSavedReportId(res.reportId);
            } catch(error:any) {
              console.error("提交失败:", error);
              toast.error(t("backtestResult.saveFailedWithReason", { reason: error.message }));
            } finally {
              setSaving(false);
            }
          };

    const saveActions = savedReportId ? (
        <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{t("backtestResult.saved")}</span>
            <Link to={`/report/${savedReportId}`} className="text-blue-600 hover:underline">{t("backtestResult.viewReport")}</Link>
        </div>
    ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
            <input
                type="text"
                name="strategyName"
                aria-label={t("backtestResult.strategyNameLabel")}
                placeholder={t("backtestResult.namePlaceholder")}
                className="w-56 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
            />
            <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {saving ? t("backtestResult.saving") : t("backtestResult.saveReport")}
            </button>
        </form>
    );


  if (status === "PENDING" || status === "RUNNING") {
    return (
      <ReportLayout>
        <Card className="flex flex-col items-center justify-center gap-4 py-24">
          <Spinner />
          <div className="text-gray-700">{t("backtestResult.running")}</div>
          {taskId && <div className="text-xs font-mono text-gray-400 break-all">{taskId}</div>}
        </Card>
      </ReportLayout>
    );
  }

  if (status === "FAILED" || !result) {
    return (
      <ReportLayout>
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("backtestResult.title")}</h1>
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-4">
            {error || (status === "FAILED" ? t("backtestResult.failed") : t("report.empty"))}
          </div>
        </div>
      </ReportLayout>
    );
  }

  return (
    <ReportLayout>
      <BacktestReportView
        result={result}
        title={t("backtestResult.title")}
        actions={saveActions}
      />
    </ReportLayout>
  );
}

export default BacktestResultPage
