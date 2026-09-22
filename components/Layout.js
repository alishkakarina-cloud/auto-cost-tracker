import Link from 'next/link';
import { useRouter } from 'next/router';
import { useData } from '../lib/DataContext';

const BOTTOM_NAV = [
  { href: '/', label: 'Главная', icon: '🏠' },
  { href: '/deals', label: 'Сделки', icon: '🤝' },
  { href: '/calculator', label: 'Калькулятор', icon: '➕', center: true },
  { href: '/cars', label: 'Авто', icon: '🚗' },
  { href: '/rates', label: 'Курсы', icon: '💱' },
];

export default function Layout({ title, children }) {
  const router = useRouter();
  const { saving } = useData();

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <Link href="/" className="brand-title">
            AUTO<span className="brand-accent">TRACKER</span>
          </Link>
          <div className="header-actions">
            {saving && <span className="saving-dot" title="Сохранение...">●</span>}
          </div>
        </div>
        {title && <h1 className="page-title">{title}</h1>}
      </header>

      <main className="content">{children}</main>

      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? 'active' : ''} ${item.center ? 'nav-center' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
