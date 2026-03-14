
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { name: 'music', href: '/music' },
    { name: 'software', href: '/software' },
    { name: 'about me', href: '/about' },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="nav-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .navbar {
          position: sticky;
          top: 1rem;
          z-index: 1000;
          display: flex;
          justify-content: center;
          padding: 0 1rem;
          margin-bottom: 2rem;
          pointer-events: none;
        }

        .navbar-inner {
          background: rgba(15, 15, 15, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
          padding: 0.5rem 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          pointer-events: auto;
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-link {
          font-family: 'Bahnschrift', 'Arial Narrow', sans-serif;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          transition: all 0.3s ease;
          padding: 0.4rem 0.8rem;
          border-radius: 1rem;
          position: relative;
        }

        .nav-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0.2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 0.3rem;
          height: 0.3rem;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px #fff;
        }

        @media (max-width: 480px) {
          .nav-links {
            gap: 0.5rem;
          }
          .nav-link {
            font-size: 0.75rem;
            padding: 0.4rem 0.6rem;
          }
        }
      `}</style>
        </nav>
    );
}
