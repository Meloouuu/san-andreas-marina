import { X } from 'lucide-react';
import { THEME } from '../../theme';
import { NavList, SidebarBrand, SidebarFooter } from './Sidebar';

export function MobileDrawer({ open, onClose, page, session, isAdmin, onNavigate, onProfile, onLogout }) {
  if (!open) return null;
  return (
    <div
      className="sam-hide-desktop fixed inset-0 sam-fade-in"
      style={{
        zIndex: 250,
        background: 'rgba(3,10,18,0.74)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="sam-modal-anim"
        style={{
          width: 292,
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(11,31,51,0.97), rgba(7,21,37,0.95))',
          backdropFilter: 'blur(26px) saturate(120%)',
          WebkitBackdropFilter: 'blur(26px) saturate(120%)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '30px 0 70px -30px rgba(2,8,16,0.95)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Halo doré derrière le logo */}
        <div
          style={{
            position: 'absolute',
            top: -110,
            left: -60,
            width: 300,
            height: 260,
            background: 'radial-gradient(circle, rgba(212,167,44,0.18), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="flex items-start justify-between" style={{ paddingRight: 14, position: 'relative' }}>
          <SidebarBrand compact />
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 999,
              width: 34,
              height: 34,
              flexShrink: 0,
              marginTop: 24,
              color: THEME.textMuted,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={18} />
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
