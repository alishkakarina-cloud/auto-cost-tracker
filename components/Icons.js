function base(children, p = {}) {
  const { size = 20, className } = p;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

export const IconWallet = (p) => base(<><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" /><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2Z" /><circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" /></>, p);

export const IconCar = (p) => base(<><path d="M4 16V11l1.8-4.2A2 2 0 0 1 7.6 5.5h8.8a2 2 0 0 1 1.8 1.3L20 11v5" /><path d="M4 16h16v2a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-9v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><circle cx="7.5" cy="16" r="1.4" /><circle cx="16.5" cy="16" r="1.4" /></>, p);

export const IconTrendUp = (p) => base(<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>, p);

export const IconFile = (p) => base(<><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></>, p);

export const IconPlus = (p) => base(<><path d="M12 5v14M5 12h14" /></>, p);

export const IconArrowRight = (p) => base(<><path d="M5 12h14M13 6l6 6-6 6" /></>, p);

export const IconBell = (p) => base(<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>, p);

export const IconUser = (p) => base(<><circle cx="12" cy="8" r="3.2" /><path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" /></>, p);

export const IconCalculator = (p) => base(<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" /></>, p);

export const IconHandshake = (p) => base(<><path d="M2 12l4-4 4 3 3-3 3 3 4-4 2 2-6 6-3-2-3 3-4-4Z" /><path d="M8 15l2 2" /></>, p);

export const IconUsers = (p) => base(<><circle cx="9" cy="8" r="3" /><path d="M3 20c.7-3 3-5 6-5s5.3 2 6 5" /><circle cx="17.5" cy="9.5" r="2.3" /><path d="M15.5 14.2c2.3.3 4 2 4.6 4.3" /></>, p);

export const IconPackage = (p) => base(<><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>, p);

export const IconReceipt = (p) => base(<><path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z" /><path d="M9 8h6M9 12h6" /></>, p);

export const IconBarChart = (p) => base(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>, p);

export const IconBook = (p) => base(<><path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2Z" /><path d="M12 3h6a2 2 0 0 1 2 2v16" /></>, p);

export const IconCheckSquare = (p) => base(<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12l3 3 5-6" /></>, p);

export const IconRepeat = (p) => base(<><path d="M4 7h13l-3-3M20 17H7l3 3" /></>, p);

export const IconHome = (p) => base(<><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" /></>, p);

export const IconSearch = (p) => base(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>, p);

export const IconPlane = (p) => base(<><path d="M10.5 3l2 6.5L20 8l1 2-7.5 3L12 19l-2-1 .5-5-4 1.5-1.5-1.5 3-2.5-4-2 1-2 6 1.5L10.5 3Z" /></>, p);

export const IconClock = (p) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>, p);

export const IconBuilding = (p) => base(<><rect x="5" y="3" width="9" height="18" /><path d="M14 8h5v13h-5M8 7h.01M8 11h.01M8 15h.01M11 7h.01M11 11h.01M11 15h.01" /></>, p);
