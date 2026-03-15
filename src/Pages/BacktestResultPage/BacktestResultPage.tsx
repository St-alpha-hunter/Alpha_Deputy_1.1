import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";
import { getBacktestResult } from "../../Service/NewBacktestService";
import type {
  BacktestResult,
  BacktestResultResponse,
} from "../../Service/NewBacktestService";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCurrentTaskId, addTask, updateTaskStatus, removeTask, clearTasks} from "../../redux/features/Task/taskSlice";
import {saveBacktestTasksToLocalStorage} from "../../Utils/localStorage";
import { toast } from "react-toastify";
import {createReport} from "../../Service/ReportService";

const BacktestResultPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const dispatch = useDispatch();
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
      setError("缺少 taskId");
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
          } catch (e) {
            console.error("解析 resultJson 失败:", e);
            setError("回测结果解析失败");
            setStatus("FAILED");
            dispatch(updateTaskStatus({ taskId, status: "FAILED" }));
          }
          return;
        }

        if (status === "FAILED") {
          setError(errorMessage || "回测失败");
          dispatch(updateTaskStatus({ taskId, status: "FAILED" }));
          return;
        }

        timer = setTimeout(poll, 2000);
      } catch (e) {
        console.error("轮询失败:", e);
        if (!stopped) {
          setStatus("FAILED");
          setError("轮询请求失败");
        }
      }
    };

    poll();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [taskId]);


  
    const username = useSelector((state: RootState) => state.username.userName);
    const [formData, setFormData] = useState({
          strategyName: "",
        });
    const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({
              ...formData,
              [name]: value
            });
          };
    const handleSubmit = async (e) => {
            e.preventDefault(); // 阻止页面刷新
            if (!result) {
              toast.error("提交失败");
              return;
            }

            try {
              const res = await createReport({
                appUserId: username, // 这里换成真实用户ID
                strategyName: formData.strategyName,
                resultJson: rawResultJson,
            });
            console.log("提交成功:", res);
            toast.success("提交成功");
            } catch(error:any) {
              console.error("提交失败:", error);
              toast.error("提交失败: " + error.message);
            }
          };


  if (status === "PENDING" || status === "RUNNING") {
  return (
    <div className="grid grid-cols-12 h-screen relative">
      <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg">
        <FactorSidebar />
      </div>

      <div className="col-span-10 col-start-3 flex flex-col items-center justify-center gap-4">
        
        {/* 转圈 */}
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

        {/* 文字 */}
        <div className="text-lg text-gray-900">
          回测运行中，请稍候...
        </div>

      </div>
    </div>
  );
  }

  if (status === "FAILED") {
    return (
      <div className="grid grid-cols-12 h-screen relative">
        <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg">
          <FactorSidebar />
        </div>

        <div className="col-span-10 col-start-3 p-6">
          <h2 className="font-bold text-black text-2xl mb-4">回测报告</h2>
          <p className="text-red-500">{error || "回测失败"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 h-screen relative">
      <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg">
        <FactorSidebar />
      </div>

      <div className="col-span-10 col-start-3 p-6">
        <h2 className="font-bold text-black text-2xl mb-4">回测报告</h2>

        {result ? (
          <div className="space-y-4">
            <div>
              <div className="font-semibold">消息</div>
              <div>{result.message}</div>
            </div>

            <div>
              <div className="font-semibold">是否成功</div>
              <div>{String(result.success)}</div>
            </div>

            <div>
              <div className="font-semibold">Sharpe</div>
              <div>{result.metrics["sharpe 夏普比率"].sharperatio}</div>
            </div>

            <div>
              <div className="font-semibold">累计收益率</div>
              <div>{result.metrics["returns 累计收益率"].rtot}</div>
            </div>

            <div>
              <div className="font-semibold">最大回撤</div>
              <div>{result.metrics["maxDrawdown 最大回撤"].drawdown}</div>
            </div>

            <div>
              <div className="font-semibold">原始结果 JSON</div>

            <form onSubmit={handleSubmit} className = "space-y-5">
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
              <div className="flex flex-col gap-y-5">
                <label>输入StrategyName策略名称</label>
                <input 
                  type="text" 
                  name="strategyName" 
                  className ="border p-2 rounded w-full bg-yellow-500"
                  value={formData.strategyName} 
                  onChange={handleChange} 
                  />
              </div>
                <button type="submit" className="bg-red-500 text-white font-bold rounded-lg w-80 h-20 border-b border-white pb-4 mb-8 ">
                  保存报告
                </button>
            </form>
            </div>
          </div>
        ) : (
          <div>暂无结果</div>
        )}
      </div>
    </div>
  );
}

export default BacktestResultPage