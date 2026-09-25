import { useEffect, useMemo, useState } from "react";
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar"
// TODO: equity curve 数据还没做好，暂不展示；做好后恢复这里和下面几处 TODO
// import EquityCurveChart from "../../Components/EquityCurveChart/EquityCurveChart";
import { Link, useParams, useNavigate } from "react-router-dom";
import { deleteReport, getReportById } from "../../Service/ReportService";
import type { ReportGet } from "../../Models/Report";
import type { BacktestResult } from "../../Service/NewBacktestService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useFactorTranslate } from "../../Helpers/useFactorTranslate";


// ---------- 格式化工具 ----------
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const fmtPct = (v: unknown, digits = 2) => (isNum(v) ? `${(v * 100).toFixed(digits)}%` : "—");
const fmtNum = (v: unknown, digits = 2) => (isNum(v) ? v.toFixed(digits) : "—");
const fmtMoney = (v: unknown) => (isNum(v) ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—");
const fmtDate = (iso?: string) => (iso ? iso.slice(0, 10) : "—");

// 后端枚举可能序列化成数字下标，也可能是字符串，两种都兼容
const enumLabel = (v: unknown, order: string[], labels: Record<string, string>) => {
    const key = isNum(v) ? order[v] : String(v ?? "");
    return labels[key] ?? (key || "—");
};

// labels 存的是翻译 key，渲染时再 t() 一下
const PRICE_TYPE = {
    order: ["next_open", "close"],
    labels: { next_open: "console.execute.priceTypeNextOpen", close: "console.execute.priceTypeClose" },
};
const HOLIDAY = {
    order: ["next_trading_day", "prev_trading_day", "skip"],
    labels: { next_trading_day: "console.rebalance.nextTradingDay", prev_trading_day: "console.rebalance.prevTradingDay", skip: "console.rebalance.skip" },
};
const FREQ_ORDER = ["Weekly", "Monthly"];


// ---------- 小组件 ----------
const Card = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => (
    <section className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>
        {title && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>}
        {children}
    </section>
);

const Kpi = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900 tabular-nums">{value}</div>
        {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0 text-sm">
        <dt className="text-gray-500">{label}</dt>
        <dd className="text-gray-900 font-medium text-right tabular-nums">{value}</dd>
    </div>
);


const ReportPage = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const [report, setReport] = useState<ReportGet | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const navigate = useNavigate();
    const { t } = useTranslation();
    const translateFactor = useFactorTranslate();

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


    const body = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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

        const m = display.metrics;
        const spec = display.rawSpec;
        // TODO: equity curve 做好后恢复——累计收益优先用净值曲线算，并显示期末资产
        // const curve = display.equityCurve ?? [];
        // const last = curve[curve.length - 1];

        // 目前只用 backtrader 的对数收益 rtot 换算累计收益
        const rtot = m?.["returns 累计收益率"]?.rtot;
        // const totalReturn = last && isNum(last.netValue) ? last.netValue - 1 : isNum(rtot) ? Math.expm1(rtot) : undefined;
        const totalReturn = isNum(rtot) ? Math.expm1(rtot) : undefined;
        const annual = m?.["returns 累计收益率"]?.rnorm100;
        const maxDD = m?.["maxDrawdown 最大回撤"]?.max;

        const rb = spec?.rebalance;
        const freqKey = isNum(rb?.freq) ? FREQ_ORDER[rb.freq] : rb?.freq;
        const rebalanceText =
            freqKey === "Weekly" ? `${t("console.rebalance.weekly")} · ${t(`console.rebalance.weekdays.${rb?.dayOfWeek ?? 1}`)}`
            : freqKey === "Monthly" ? `${t("console.rebalance.monthly")} · ${t("console.rebalance.dayOfMonth", { day: rb?.dayOfMonth ?? 1 })}`
            : "—";

        const inputs = spec?.signal?.inputs ?? [];

        return (
            <div className="space-y-6">
                {/* 头部 */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link to="/report" className="text-sm text-gray-500 hover:text-gray-800">{t("report.backToList")}</Link>
                        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">{report.strategyName || t("report.untitled")}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${display.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {display.success ? t("report.succeeded") : t("report.failed")}
                            </span>
                            <span className="text-gray-500">
                                {fmtDate(spec?.timeRange?.startDate)} → {fmtDate(spec?.timeRange?.endDate)}
                            </span>
                            {spec?.universe && <span className="text-gray-400">· {spec.universe}</span>}
                        </div>
                    </div>

                    {confirmingDelete ? (
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
                    )}
                </div>

                {!display.success && display.message && (
                    <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-4">{display.message}</div>
                )}

                {/* 核心指标 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* TODO: equity curve 做好后恢复期末资产：sub={last ? t("report.endingValue", { value: fmtMoney(last.value) }) : undefined} */}
                    <Kpi label={t("report.totalReturn")} value={fmtPct(totalReturn)} />
                    <Kpi label={t("report.annualReturn")} value={isNum(annual) ? `${annual.toFixed(2)}%` : "—"} />
                    <Kpi label={t("report.sharpe")} value={fmtNum(m?.["sharpe 夏普比率"]?.sharperatio)} />
                    <Kpi
                        label={t("report.maxDrawdown")}
                        value={isNum(maxDD?.drawdown) ? `${maxDD.drawdown.toFixed(2)}%` : "—"}
                        sub={isNum(maxDD?.len) ? t("report.drawdownDays", { days: maxDD.len }) : undefined}
                    />
                </div>

                {/* TODO: 净值曲线，equity curve 做好后恢复 */}
                {/* <Card title={t("report.equityCurve")}>
                    <EquityCurveChart data={curve} showTitle={false} />
                </Card> */}

                {/* 策略配置 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title={t("report.factors")}>
                        {inputs.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-200">
                                        <th className="py-2 font-medium">{t("report.factor")}</th>
                                        <th className="py-2 font-medium text-right">{t("report.weight")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inputs.map((f, i) => (
                                        <tr key={`${f.codeKey}-${i}`} className="border-b border-gray-100 last:border-0">
                                            <td className="py-2 text-gray-900">{translateFactor(f.factor) || f.codeKey}</td>
                                            <td className="py-2 text-right tabular-nums">{fmtNum(f.weight)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-sm text-gray-400">{t("report.noFactors")}</div>
                        )}
                        <dl className="mt-4">
                            <Row label={t("report.lookback")} value={spec?.signal?.lookback ?? "—"} />
                            <Row label={t("report.lag")} value={spec?.signal?.lag ?? "—"} />
                        </dl>
                    </Card>

                    <Card title={t("report.portfolioRebalance")}>
                        <dl>
                            <Row label={t("console.portfolio.initialCash")} value={fmtMoney(spec?.portfolio?.initialCash)} />
                            <Row label={t("console.portfolio.numberOfStocks")} value={spec?.portfolio?.selector?.k ?? "—"} />
                            <Row label={t("console.portfolio.targetCashWeight")} value={fmtPct(spec?.portfolio?.targetCashWeight, 0)} />
                            <Row label={t("console.rebalance.freq")} value={rebalanceText} />
                            <Row label={t("console.rebalance.holidayPolicy")} value={t(enumLabel(rb?.holidayPolicy, HOLIDAY.order, HOLIDAY.labels))} />
                            <Row label={t("console.timeRange.calendar")} value={spec?.timeRange?.calendar ?? "—"} />
                        </dl>
                    </Card>

                    <Card title={t("report.risk")}>
                        <dl>
                            <Row label={t("console.risk.maxDrawdown")} value={fmtPct(spec?.riskManagement?.maxDrawdown, 0)} />
                            <Row label={t("console.risk.maxPositionWeight")} value={fmtPct(spec?.riskManagement?.maxPositionWeight, 1)} />
                            <Row label={t("console.risk.maxTurnover")} value={fmtNum(spec?.riskManagement?.maxTurnover)} />
                            <Row label={t("console.risk.maxLeverage")} value={isNum(spec?.riskManagement?.maxLeverage) ? `${spec.riskManagement.maxLeverage}x` : "—"} />
                            <Row label={t("console.risk.volTarget")} value={fmtPct(spec?.riskManagement?.volTarget, 0)} />
                        </dl>
                    </Card>

                    <Card title={t("report.execution")}>
                        <dl>
                            <Row label={t("console.execute.priceType")} value={t(enumLabel(spec?.execute?.priceType, PRICE_TYPE.order, PRICE_TYPE.labels))} />
                            <Row label={t("console.execute.commission")} value={fmtPct(spec?.execute?.commissionBps, 3)} />
                            <Row label={t("console.execute.slippage")} value={fmtPct(spec?.execute?.slippageBps, 3)} />
                            <Row label={t("console.execute.allowShort")} value={spec?.execute ? (spec.execute.allowShort ? t("report.yes") : t("report.no")) : "—"} />
                            <Row label={t("report.tradeCount")} value={display.tradeList?.length ?? 0} />
                        </dl>
                    </Card>
                </div>

                {/* 原始数据，默认折叠 */}
                <details className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium text-gray-600 hover:text-gray-900">
                        {t("report.rawJson")}
                    </summary>
                    <pre className="mx-5 mb-5 bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-[480px]">
                        {JSON.stringify(display, null, 2)}
                    </pre>
                </details>
            </div>
        );
    };


  return (
    <div className="grid grid-cols-12 min-h-screen relative bg-gray-50">
      <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg">
        <FactorSidebar />
      </div>

      <div className="col-span-10 col-start-3 p-6 max-w-6xl w-full">
        {body()}
      </div>
    </div>
  );

}

export default ReportPage;
