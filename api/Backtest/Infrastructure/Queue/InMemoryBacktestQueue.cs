using System.Collections.Concurrent;
using System.Threading.Channels;
using api.Backtest.Interface;

namespace api.Backtest.Infrastructure.Queue
{
    /// <summary>
    /// 单进程内存队列：适合本机开发/单实例。
    /// 多实例部署时要换成 Redis Stream / RabbitMQ 等实现。
    /// </summary>
    public sealed class InMemoryBacktestQueue : IBacktestQueue
    {
        private readonly Channel<Guid> _channel;
        private readonly ILogger<InMemoryBacktestQueue> _logger;

        public InMemoryBacktestQueue(ILogger<InMemoryBacktestQueue> logger, int capacity = 10_000)
        {
            _logger = logger;
            // Bounded：防止无上限占内存
            var options = new BoundedChannelOptions(capacity)
            {
                FullMode = BoundedChannelFullMode.Wait,
                SingleReader = false,
                SingleWriter = false
            };
            _channel = Channel.CreateBounded<Guid>(options);
        }

        public int Count => _channel.Reader.Count;

        //入队
        public async ValueTask EnqueueAsync(Guid taskId, CancellationToken ct = default)
        {
            if (taskId == Guid.Empty)
                throw new ArgumentException("taskId is required.", nameof(taskId));

            await _channel.Writer.WriteAsync(taskId, ct);
            _logger.LogInformation("[QUEUE] 入队成功 Enqueue taskId={TaskId}", taskId);
        }
        //出队
        public async ValueTask<Guid> DequeueAsync(CancellationToken ct = default)
        {
            var item = await _channel.Reader.ReadAsync(ct);
            _logger.LogInformation("[QUEUE] 执行完毕 出队 Dequeue taskId={TaskId}", item);
            return item;
        }
    }
}

//说明：用 Channel<T> 比自己写锁+队列更稳（支持阻塞等待、取消、背压）。