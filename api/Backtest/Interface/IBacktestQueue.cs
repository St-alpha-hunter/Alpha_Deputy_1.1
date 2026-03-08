using System.Threading;
using System.Threading.Tasks;

namespace api.Backtest.Interface
{
    /// <summary>
    /// 任务队列抽象：负责把 taskId 入队，以及让 worker 取出 taskId 执行。
    /// </summary>
    public interface IBacktestQueue
    {
        ValueTask EnqueueAsync(Guid taskId, CancellationToken ct = default);

///看看任务taskid这个类型怎么选
        /// <summary>
        /// 阻塞等待直到有任务可取（或取消）。
        /// </summary>
        ValueTask<Guid> DequeueAsync(CancellationToken ct = default);

        int Count { get; }
    }
}
