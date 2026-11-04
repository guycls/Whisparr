using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(222)]
    public class add_series_scene_bookmarks : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("SeriesSceneBookmarks")
                  .WithColumn("SeriesId").AsInt32().NotNullable()
                  .WithColumn("ReleaseDateAscending").AsString().NotNullable().WithDefaultValue("[]")
                  .WithColumn("ReleaseDateDescending").AsString().NotNullable().WithDefaultValue("[]")
                  .WithColumn("TitleAscending").AsString().NotNullable().WithDefaultValue("[]")
                  .WithColumn("TitleDescending").AsString().NotNullable().WithDefaultValue("[]");

            Create.Index("IX_SeriesSceneBookmarks_SeriesId")
                  .OnTable("SeriesSceneBookmarks")
                  .OnColumn("SeriesId")
                  .Ascending()
                  .WithOptions()
                  .Unique();
        }
    }
}
