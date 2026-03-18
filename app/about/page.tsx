
import { getAboutContent } from "@/app/lib/db";

export const metadata = {
  title: 'About Me',
};

export default async function AboutPage() {
  const textContent = await getAboutContent();

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
