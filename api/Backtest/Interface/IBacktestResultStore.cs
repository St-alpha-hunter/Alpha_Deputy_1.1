using System.Threading;
using System.Threading.Tasks;

namespace api.Backtest.Interface
{
    public interface IBacktestResultStore
    {
        /// <summary>
        /// 保存结果内容，返回可存入 DB 的 resultPath（可以是相对路径或绝对路径）。
        /// </summary>
        Task<string> SaveAsync(
            string taskId,
            string fileName,
            byte[] content,
            string contentType = "application/octet-stream",
            CancellationToken ct = default);

        /// <summary>
        /// 读取结果内容（可选：你现在不一定用得到，先留着）。
        /// </summary>
        Task<byte[]> ReadAsync(string resultPath, CancellationToken ct = default);

        /// <summary>
        /// 检查结果是否存在（可选）。
        /// </summary>
        Task<bool> ExistsAsync(string resultPath, CancellationToken ct = default);

    }
}
