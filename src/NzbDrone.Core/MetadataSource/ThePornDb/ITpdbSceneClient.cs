namespace NzbDrone.Core.MetadataSource.ThePornDb
{
    public interface ITpdbSceneClient
    {
        string GetScreenshotUrl(int sceneId);
        string GetSceneUuid(int sceneId);
        TpdbSceneReference GetSceneByUuid(string sceneUuid);
    }
}
