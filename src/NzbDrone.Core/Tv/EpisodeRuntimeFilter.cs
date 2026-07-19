using System;

namespace NzbDrone.Core.Tv
{
    public static class EpisodeRuntimeFilter
    {
        public static int RoundRuntimeMax(int maxRuntime)
        {
            if (maxRuntime <= 0)
            {
                return 0;
            }

            return (int)Math.Ceiling(maxRuntime / 10.0) * 10;
        }
    }
}
