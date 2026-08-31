import { ChevronRight, LogOut, User, Home, Ship, ClipboardList, CalendarDays, ShieldCheck, Settings, Users as UsersIcon, Database as DatabaseIcon, History as HistoryIcon } from 'lucide-react';
import { THEME, LOGO } from '../../theme';
import { fullName } from '../../lib/utils';
import { Avatar } from '../ui';

export const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', label: 'Accueil', icon: Home },
      { id: 'garage', label: 'Garage', icon: Ship },
      { id: 'rentals', label: 'Suivi des locations', icon: ClipboardList },
      { id: 'planning', label: 'Planning', icon: CalendarDays },
    ],
  },
  {
    label: 'Activités',
    items: [
      { id: 'permits', label: 'Permis & Formations', icon: ShieldCheck },
      { id: 'citizens', label: 'Citoyens / Clients', icon: UsersIcon },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { id: 'database', label: 'Base de données', icon: DatabaseIcon },
      { id: 'history', label: 'Historique', icon: HistoryIcon },
    ],
  },
];

export function NavItem({ item, active, onNavigate }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={`sam-nav-item ${active ? 'active' : ''}`}
      onClick={() => onNavigate(item.id)}
    >
      <span className="sam-nav-icon">
        <Icon size={17} strokeWidth={active ? 2.4 : 1.9} />
      </span>
      <span className="sam-nav-label">{item.label}</span>
      {active && <span className="sam-nav-dot" />}
    </button>
  );
}

export function SidebarBrand({ compact }) {
  return (
    <div className="sam-brand">
      <div className="sam-brand-logo">
        <img
          src={LOGO}
          alt="San Andreas Marina"
          style={{
            width: compact ? 44 : 58,
            height: compact ? 44 : 58,
            objectFit: 'contain',
            position: 'relative',
          }}
        />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="sam-display sam-brand-name">San Andreas</div>
        <div className="sam-display sam-brand-name gold">Marina</div>
        <div className="sam-brand-tag">Location de bateaux</div>
      </div>
    </div>
  );
}

export function NavList({ page, isAdmin, onNavigate }) {
  return (
    <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 12px 12px' }}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="sam-nav-section-label">{section.label}</div>
          {section.items.map((item) => (
            <NavItem key={item.id} item={item} active={page === item.id} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
      {isAdmin && (
        <div>
          <div className="sam-nav-section-label">Administration</div>
          <NavItem
            item={{ id: 'admin', label: 'Admin', icon: Settings }}
            active={page === 'admin'}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </nav>
  );
}

export function SidebarFooter({ user, onProfile, onLogout }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 14px' }}>
      <button type="button" className="sam-profile-card" onClick={onProfile}>
        <Avatar name={fullName(user)} photo={user.photo} size={42} />
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <span
            style={{
              display: 'block',
              fontSize: 13.5,
              fontWeight: 700,
              color: THEME.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {fullName(user)}
          </span>
          <span style={{ display: 'block', fontSize: 11.5, color: THEME.gold, fontWeight: 600 }}>
            {user.role === 'admin' ? 'Administrateur' : 'Employé(e)'}
          </span>
        </span>
        <ChevronRight size={15} color={THEME.textMuted} />
      </button>
      <div className="flex gap-2" style={{ marginTop: 9 }}>
        <button className="sam-btn sam-btn-ghost sam-btn-sm" style={{ flex: 1 }} onClick={onProfile}>
          <User size={14} /> Mon profil
        </button>
        <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={onLogout} title="Déconnexion">
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ page, session, isAdmin, onNavigate, onProfile, onLogout }) {
  return (
    <div
      className="sam-hide-mobile"
      style={{
        width: 282,
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(11,31,51,0.9), rgba(7,21,37,0.82))',
        backdropFilter: 'blur(26px) saturate(120%)',
        WebkitBackdropFilter: 'blur(26px) saturate(120%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '18px 0 60px -30px rgba(2,8,16,0.9)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      {/* Halo doré derrière le logo */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: -60,
          width: 320,
          height: 280,
          background: 'radial-gradient(circle, rgba(212,167,44,0.16), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <SidebarBrand />
      <NavList page={page} isAdmin={isAdmin} onNavigate={onNavigate} />
      <SidebarFooter user={session} onProfile={onProfile} onLogout={onLogout} />
    </div>
  );
}

