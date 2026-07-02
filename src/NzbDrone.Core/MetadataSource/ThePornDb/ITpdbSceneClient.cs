namespace NzbDrone.Core.MetadataSource.ThePornDb
{
    public interface ITpdbSceneClient
    {
        string GetScreenshotUrl(int sceneId);
    }
}
