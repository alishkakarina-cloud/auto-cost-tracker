import Link from 'next/link';
import { useRouter } from 'next/router';
import { useData } from '../lib/DataContext';
import { IconHome, IconHandshake, IconPlus, IconCar, IconRepeat, IconBell, IconUser } from './Icons';

const BOTTOM_NAV = [
  { href: '/', label: 'Главная', Icon: IconHome },
  { href: '/deals', label: 'Сделки', Icon: IconHandshake },
  { href: '/calculator', label: 'Калькулятор', Icon: IconPlus, center: true },
  { href: '/cars', label: 'Авто', Icon: IconCar },
  { href: '/rates', label: 'Курсы', Icon: IconRepeat },
];

export default function Layout({ title, children }) {
  const router = useRouter();
  const { saving } = useData();

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <Link href="/" className="brand-block">
            <span className="brand-title">AUTO<span className="brand-thin">TRACKER</span></span>
            <span className="brand-sub">CARS · BUSINESS · IMPORT</span>
          </Link>
          <div className="header-actions">
            {saving && <span className="saving-dot" title="Сохранение...">●</span>}
            <span className="location-pill">🇦🇪 Дубай</span>
            <span className="icon-circle"><IconBell size={16} /></span>
            <span className="icon-circle"><IconUser size={16} /></span>
          </div>
        </div>
        {title && <h1 className="page-title">{title}</h1>}
      </header>

      <main className="content">{children}</main>

      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const active = router.pathname === item.href;
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? 'active' : ''} ${item.center ? 'nav-center' : ''}`}
            >
              <span className="nav-icon"><Icon size={item.center ? 22 : 18} /></span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
