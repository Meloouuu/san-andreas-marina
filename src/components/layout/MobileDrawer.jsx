import { X } from 'lucide-react';
import { THEME } from '../../theme';
import { NavList, SidebarBrand, SidebarFooter } from './Sidebar';

export function MobileDrawer({ open, onClose, page, session, isAdmin, onNavigate, onProfile, onLogout }) {
  if (!open) return null;
  return (
    <div
      className="sam-hide-desktop fixed inset-0 sam-fade-in"
      style={{ zIndex: 250, background: 'rgba(3,10,18,0.72)' }}
      onClick={onClose}
    >
      <div
        className="sam-modal-anim"
        style={{
          width: 288,
          height: '100vh',
          background: THEME.bg2,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${THEME.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between" style={{ paddingRight: 12 }}>
          <SidebarBrand compact />
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: THEME.textMuted,
              cursor: 'pointer',
              padding: 18,
            }}
          >
            <X size={20} />
          </button>
        </div>
        <NavList
          page={page}
          isAdmin={isAdmin}
          onNavigate={(id) => {
            onNavigate(id);
            onClose();
          }}
        />
        <SidebarFooter
          user={session}
          onProfile={() => {
            onProfile();
            onClose();
          }}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}

