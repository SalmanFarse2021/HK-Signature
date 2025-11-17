export function Icon({ name, className = 'h-5 w-5' }) {
  const common = { fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor' };
  switch (name) {
    case 'dashboard':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l7.5-7.5 7.5 7.5M4.5 12.75V19.5A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5v-6.75" /></svg>
      );
    case 'products':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-4.5-9 4.5M3 7.5v9l9 4.5 9-4.5v-9" /></svg>
      );
    case 'orders':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15M4.5 12h15m-15 5.25H12" /></svg>
      );
    case 'users':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75H4.5v-.75z"/></svg>
      );
    case 'logout':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
      );
    case 'sun':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v2.25m0 12v2.25m8.25-8.25h-2.25m-12 0H3.75M18.364 5.636l-1.591 1.591M7.227 16.773l-1.591 1.591m12.728 0l-1.591-1.591M7.227 7.227L5.636 5.636M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      );
    case 'moon':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75A8.25 8.25 0 1111.25 3a6.75 6.75 0 109.75 9.75z"/></svg>
      );
    case 'upload':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V6m0 0l-3.75 3.75M12 6l3.75 3.75M6.75 18.75h10.5A2.25 2.25 0 0019.5 16.5v0A2.25 2.25 0 0017.25 14.25h-10.5A2.25 2.25 0 004.5 16.5v0a2.25 2.25 0 002.25 2.25z"/></svg>
      );
    case 'download':
      return (
        <svg {...common} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v10.5m0 0l3.75-3.75M12 18l-3.75-3.75M6.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v0A2.25 2.25 0 0117.25 9.75h-10.5A2.25 2.25 0 014.5 7.5v0a2.25 2.25 0 012.25-2.25z"/></svg>
      );
    default:
      return null;
  }
}
