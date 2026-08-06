using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(219)]
    public class add_siterip_indexes : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Execute.Sql("UPDATE \"SiteRipDownloads\" SET \"DownloadId\" = LOWER(\"DownloadId\")");

            Create.Index("IX_SiteRipDownloads_DownloadId")
                  .OnTable("SiteRipDownloads")
                  .OnColumn("DownloadId")
                  .Ascending();

            Create.Index("IX_SiteRipDownloadFiles_SiteRipDownloadId")
                  .OnTable("SiteRipDownloadFiles")
                  .OnColumn("SiteRipDownloadId")
                  .Ascending();

            Create.Index("IX_SiteRipDownloadFiles_SiteRipDownloadId_Imported")
                  .OnTable("SiteRipDownloadFiles")
                  .OnColumn("SiteRipDownloadId")
                  .Ascending()
                  .OnColumn("Imported")
                  .Ascending();
        }
    }
}
