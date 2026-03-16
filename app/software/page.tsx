
import { getSoftware } from "@/app/lib/db";

export const metadata = {
  title: 'Software',
};

export default async function SoftwarePage() {
  const files = await getSoftware();


  return (
    <main className="container software-page">
      <h1 className="page-title">Tools & Software</h1>

      <div className="software-grid">
        {files.length === 0 ? (
          <div className="empty-state glass-panel">
            <p>No software available yet. Check back soon.</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="software-card glass-panel">
              <div className="card-header">
                <h3 className="file-title">{file.name}</h3>
              </div>
              {file.description && (
                <p className="file-description">{file.description}</p>
              )}
              <div className="card-actions">
                <a
                  href={file.blob_url}
                  className="download-btn"
                  download
                >
                  ↓ Instant Download
                </a>

              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
