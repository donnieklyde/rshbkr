
import { getFileContent, getFolderFiles } from "@/app/lib/drive";

export const metadata = {
  title: 'About Me',
};

export default async function AboutPage() {
  const folderId = '1p5bpV5GxXCz3ZeVA3-6G1rpgRV6zZ5gl';
  console.log('AboutPage: Fetching bio text from folder', folderId);
  const files = await getFolderFiles(folderId).catch(err => {
    console.error('AboutPage: Failed to get files', err);
    return [];
  });

  const textFile = files.find(f => f.name.toLowerCase().includes('about me') && f.type === 'text');

  let textContent = 'RSHBKR is an underground artist and developer.';
  if (textFile) {
    try {
      textContent = await getFileContent(textFile.id) || textContent;
    } catch (err) {
      console.error('AboutPage: Failed to get file content', err);
    }
  }

  return (
    <main className="container about-page">
      <div className="glass-panel content-wrapper">
        <h1 className="page-title">About Me</h1>

        <div className="bio-content">
          {textContent.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="image-wrapper">
          <img
            src="/images/RSHBKR.jpg"
            alt="RSHBKR"
            className="bio-image"
          />
        </div>
      </div>
    </main>
  );
}
