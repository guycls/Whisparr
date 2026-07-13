using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(217)]
    public class add_siterip_downloads : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("SiteRipDownloads")
                  .WithColumn("DownloadId").AsString().NotNullable()
                  .WithColumn("SeriesId").AsInt32().NotNullable()
                  .WithColumn("TorrentTitle").AsString().NotNullable()
                  .WithColumn("DownloadClientId").AsInt32().NotNullable();

            Create.TableForModel("SiteRipDownloadFiles")
                  .WithColumn("SiteRipDownloadId").AsInt32().NotNullable()
                  .WithColumn("EpisodeId").AsInt32().NotNullable()
                  .WithColumn("FileIndex").AsInt32().NotNullable()
                  .WithColumn("FilePath").AsString().NotNullable()
                  .WithColumn("PartNumber").AsInt32().Nullable()
                  .WithColumn("Imported").AsBoolean().NotNullable().WithDefaultValue(false);
        }
    }
}
