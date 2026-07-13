using System.Collections.Generic;

namespace NzbDrone.Core.History
{
    public static class HistoryDataExtensions
    {
        public static bool GetShouldOverride(this Dictionary<string, string> data)
        {
            return data?.GetValueOrDefault(HistoryDataKeys.ShouldOverride) == "true";
        }

        public static void SetShouldOverride(this Dictionary<string, string> data, bool value)
        {
            if (value)
            {
                data[HistoryDataKeys.ShouldOverride] = "true";
            }
            else
            {
                data.Remove(HistoryDataKeys.ShouldOverride);
            }
        }

        public static bool GetIsSiteRip(this Dictionary<string, string> data)
        {
            return data?.GetValueOrDefault(HistoryDataKeys.IsSiteRip) == "true";
        }

        public static void SetIsSiteRip(this Dictionary<string, string> data, bool value)
        {
            if (value)
            {
                data[HistoryDataKeys.IsSiteRip] = "true";
            }
            else
            {
                data.Remove(HistoryDataKeys.IsSiteRip);
            }
        }
    }
}
