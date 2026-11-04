using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(220)]
    public class add_episode_file_hardlinks : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("EpisodeFiles").AddColumn("HardLinkVolumeId").AsString().Nullable();
            Alter.Table("EpisodeFiles").AddColumn("HardLinkFileId").AsString().Nullable();

            Create.TableForModel("EpisodeFileHardLinks")
                  .WithColumn("EpisodeFileId").AsInt32().NotNullable()
                  .WithColumn("Path").AsString().NotNullable();

            Create.Index("IX_EpisodeFileHardLinks_EpisodeFileId")
                  .OnTable("EpisodeFileHardLinks")
                  .OnColumn("EpisodeFileId")
                  .Ascending();

            Create.Index("IX_EpisodeFileHardLinks_Path")
                  .OnTable("EpisodeFileHardLinks")
                  .OnColumn("Path")
                  .Ascending();
        }
    }
}
