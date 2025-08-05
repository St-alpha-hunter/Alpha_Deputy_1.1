using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace api.Service
{
    public class AssetSidService
    {
        private Dictionary<string, long> _symbolToSidMap;
        private long _nextSid;
        private readonly string _filePath = "sid_map.json"; // 文件路径

        public AssetSidService()
        {
            _symbolToSidMap = new Dictionary<string, long>();
            _nextSid = 1; // 默认起始Sid
            LoadFromFile();
        }

        private void LoadFromFile()
        {
            if (!File.Exists(_filePath))
                return;

            try
            {
                var json = File.ReadAllText(_filePath);
                var data = JsonSerializer.Deserialize<Dictionary<string, long>>(json);
                if (data != null)
                {
                    _symbolToSidMap = data;
                    // 更新 _nextSid 为当前最大 Sid + 1
                    if (_symbolToSidMap.Count > 0)
                        _nextSid = Math.Max(_nextSid, GetMaxSid() + 1);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ 加载 Sid 映射失败: {ex.Message}");
            }
        }

        public void SaveToFile()
        {
            try
            {
                var json = JsonSerializer.Serialize(_symbolToSidMap, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_filePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ 保存 Sid 映射失败: {ex.Message}");
            }
        }

        private long GetMaxSid()
        {
            long maxSid = 0;
            foreach (var sid in _symbolToSidMap.Values)
            {
                if (sid > maxSid)
                    maxSid = sid;
            }
            return maxSid;
        }

        public long GetOrCreateSid(string symbol)
        {
            if (_symbolToSidMap.TryGetValue(symbol, out var sid))
                return sid;

            sid = _nextSid++;
            _symbolToSidMap[symbol] = sid;
            SaveToFile(); // 每次创建新映射后立即保存
            return sid;
        }

        // 可用于特殊情况手动获取下一个 Sid
        public long GenerateNextSid()
        {
            return _nextSid++;
        }
    }
}
