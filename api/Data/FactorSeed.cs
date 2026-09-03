using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public static class FactorSeed
{
    public static async Task EnsureSeededAsync(ApplicationDBContext db)
    {
        var now = DateTime.UtcNow;
        var seeds = new[]
        {
            CreateMomentumFactor("5-Day Momentum", "mom_5", 5, now),
            CreateMomentumFactor("10-Day Momentum", "mom_10", 10, now),
            CreateMomentumFactor("20-Day Momentum", "mom_20", 20, now),
            CreateMomentumFactor("60-Day Momentum", "mom_60", 60, now),
            CreateMomentumFactor("120-Day Momentum", "mom_120", 120, now),
            CreateMomentumFactor("252-Day Momentum", "mom_252", 252, now),
        };

        var existingCodeKeys = await db.Factors
            .AsNoTracking()
            .Select(factor => factor.CodeKey)
            .ToListAsync();
        var existing = existingCodeKeys.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var missing = seeds.Where(factor => !existing.Contains(factor.CodeKey)).ToList();

        if (missing.Count == 0)
        {
            return;
        }

        await db.Factors.AddRangeAsync(missing);
        await db.SaveChangesAsync();
    }

    private static Factor CreateMomentumFactor(
        string name,
        string codeKey,
        int window,
        DateTime timestamp)
    {
        return new Factor
        {
            Name = name,
            CodeKey = codeKey,
            Category = "Momentum",
            Description = $"Adjusted-close return over the previous {window} trading days.",
            ComputeCode = $"adjClose / adjClose.shift({window}) - 1",
            CreatedAt = timestamp,
            UpdatedAt = timestamp,
            Enabled = true,
        };
    }
}
