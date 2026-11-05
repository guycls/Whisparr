namespace NzbDrone.Core.Tv
{
    public class EpisodeOrder
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool Monitored { get; set; }
        public int EpisodeFileId { get; set; }
    }
}
