/* ============================================================
   SAN ANDREAS MARINA — Logiciel de gestion interne
   ============================================================ */

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { THEME, SESSION_KEY, LOGO } from './theme';
import { uid } from './lib/utils';
import { sessionStore } from './lib/sessionStore';
import { GlobalStyles, ToastStack, MobileToasts } from './components/ui';
import { Sidebar, MobileTopBar, MobileDrawer, NotificationBell } from './components/layout';
import { useAppActions } from './hooks/useAppActions';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GaragePage } from './pages/GaragePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { RentalsPage } from './pages/RentalsPage';
import { PlanningPage } from './pages/PlanningPage';
import { PermitsPage } from './pages/PermitsPage';
import { CitizensPage } from './pages/CitizensPage';
import { CitizenDetailPage } from './pages/CitizenDetailPage';
import { DatabasePage } from './pages/DatabasePage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';


/* ============================================================
   APPLICATION PRINCIPALE
   ============================================================ */

function App() {
  const [db, setDb] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifLog, setNotifLog] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    (async () => {
      let loadedDb = null;
      try {
        const { loadDatabase } = await import('./lib/supabaseDb');

        loadedDb = await loadDatabase();

      } catch (e) {
        console.error('Impossible de charger la base Supabase :', e);
        setLoadError(e && e.message ? e.message : 'Erreur inconnue');
        setLoaded(true);
        return;
      }

      setDb(loadedDb);

      try {
        const sres = await sessionStore.get(SESSION_KEY, false);
        if (sres && sres.value) {
          const found = loadedDb.users.find((u) => u.id === sres.value);
          if (found) setSession(found);
        }
      } catch (e) {
        /* pas de session active */
      }

      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (session && db) {
      const fresh = db.users.find((u) => u.id === session.id);
      if (!fresh) {
        setSession(null);
        return;
      }
      if (JSON.stringify(fresh) !== JSON.stringify(session)) setSession(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  function notify(message, type) {
    const id = uid('t');
    setToasts((prev) => [...prev, { id, message, type: type || 'success' }]);
    setNotifLog((prev) => [...prev.slice(-19), { id, message, type: type || 'success' }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }

  /* La verification du mot de passe se fait en base, sur l'empreinte du seul
     compte concerne : `db.users` ne contient plus aucun mot de passe. */
  async function handleLogin(email, password) {
    const echec = { ok: false, error: 'Adresse e-mail ou mot de passe incorrect.' };

    let userId;
    try {
      const { authenticateUser } = await import('./lib/supabaseDb');
      userId = await authenticateUser(email, password);
    } catch (error) {
      console.error('❌ Erreur de connexion :', error);
      return { ok: false, error: 'Connexion impossible. Veuillez réessayer.' };
    }

    const user = userId ? db.users.find((u) => u.id === userId) : null;
    if (!user) return echec;

    setSession(user);
    sessionStore.set(SESSION_KEY, user.id, false);
    setPage('dashboard');

    return { ok: true };
  }

  function handleLogout() {
    setSession(null);
    sessionStore.remove(SESSION_KEY, false);
    setMobileMenuOpen(false);
    setPage('dashboard');
  }

  function navigate(p) {
    setPage(p);
    setMobileMenuOpen(false);
  }
  function openVehicle(id) {
    setSelectedVehicleId(id);
    setPage('garage-detail');
  }
  function openCitizen(id) {
    setSelectedCitizenId(id);
    setPage('citizen-detail');
  }

  const actions = useAppActions({ db, setDb, notify });

  if (loadError) {
    return (
      <div
        className="sam-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <GlobalStyles />
        <div className="sam-card sam-fade-in" style={{ maxWidth: 460, padding: 32, textAlign: 'center' }}>
          <img
            src={LOGO}
            alt="San Andreas Marina"
            style={{ width: 72, height: 72, objectFit: 'contain', opacity: 0.9 }}
          />
          <h2 className="sam-display" style={{ fontSize: 21, fontWeight: 700, margin: '16px 0 8px' }}>
            Connexion a la base impossible
          </h2>
          <p style={{ color: THEME.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 8px' }}>
            L&apos;application n&apos;a pas pu joindre la base de donnees Supabase. Verifiez votre connexion
            internet ainsi que les cles d&apos;acces du projet.
          </p>
          <p
            style={{
              color: THEME.error,
              fontSize: 12.5,
              fontFamily: 'monospace',
              margin: '0 0 20px',
              wordBreak: 'break-word',
            }}
          >
            {loadError}
          </p>
          <button className="sam-btn sam-btn-gold" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Reessayer
          </button>
        </div>
      </div>
    );
  }

  if (!loaded || !db) {
    return (
      <div
        className="sam-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlobalStyles />
        <img
          src={LOGO}
          alt="San Andreas Marina"
          style={{ width: 84, height: 84, opacity: 0.85 }}
          className="sam-fade-in"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="sam-root">
        <GlobalStyles />
        <LoginPage onLogin={handleLogin} notify={notify} />
        <ToastStack toasts={toasts} />
        <MobileToasts toasts={toasts} />
      </div>
    );
  }

  const isAdmin = session.role === 'admin';

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <DashboardPage db={db} session={session} navigate={navigate} />;
      case 'garage':
        return (
          <GaragePage db={db} actions={actions} isAdmin={isAdmin} notify={notify} openVehicle={openVehicle} />
        );
      case 'garage-detail':
        return (
          <VehicleDetailPage
            db={db}
            actions={actions}
            isAdmin={isAdmin}
            session={session}
            notify={notify}
            vehicleId={selectedVehicleId}
            back={() => setPage('garage')}
          />
        );
      case 'rentals':
        return <RentalsPage db={db} actions={actions} isAdmin={isAdmin} session={session} notify={notify} />;
      case 'planning':
        return <PlanningPage db={db} actions={actions} notify={notify} session={session} />;
      case 'permits':
        return (
          <PermitsPage
            db={db}
            actions={actions}
            isAdmin={isAdmin}
            notify={notify}
            openCitizen={openCitizen}
          />
        );
      case 'citizens':
        return <CitizensPage db={db} notify={notify} openCitizen={openCitizen} />;
      case 'citizen-detail':
        return (
          <CitizenDetailPage
            db={db}
            actions={actions}
            citizenId={selectedCitizenId}
            back={() => setPage('citizens')}
          />
        );
      case 'database':
        return <DatabasePage db={db} isAdmin={isAdmin} />;
      case 'history':
        return <HistoryPage db={db} />;
      case 'profile':
        return <ProfilePage session={session} db={db} actions={actions} notify={notify} />;
      case 'admin':
        return isAdmin ? (
          <AdminPage db={db} actions={actions} notify={notify} session={session} />
        ) : (
          <DashboardPage db={db} session={session} navigate={navigate} />
        );
      default:
        return <DashboardPage db={db} session={session} navigate={navigate} />;
    }
  }

  return (
    <div className="sam-root" style={{ display: 'flex' }}>
      <GlobalStyles />
      <Sidebar
        page={page}
        session={session}
        isAdmin={isAdmin}
        onNavigate={navigate}
        onProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <MobileTopBar
          onOpenMenu={() => setMobileMenuOpen(true)}
          onBell={() => setBellOpen((o) => !o)}
          notifCount={notifLog.length}
        />

        <div className="sam-hide-mobile flex justify-end" style={{ padding: '18px 32px 0' }}>
          <NotificationBell log={notifLog} open={bellOpen} setOpen={setBellOpen} />
        </div>

        {bellOpen && (
          <div
            className="sam-hide-desktop sam-card sam-modal-anim"
            style={{
              position: 'fixed',
              top: 62,
              left: 14,
              right: 14,
              maxHeight: 340,
              overflowY: 'auto',
              zIndex: 260,
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${THEME.border}`,
                fontWeight: 700,
                fontSize: 13.5,
              }}
            >
              Notifications
            </div>
            {notifLog.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
                Aucune notification récente.
              </div>
            ) : (
              notifLog
                .slice()
                .reverse()
                .map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 13,
                    }}
                  >
                    {n.message}
                  </div>
                ))
            )}
          </div>
        )}

        <div className="sam-content" style={{ flex: 1 }}>
          {renderPage()}
        </div>
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        page={page}
        session={session}
        isAdmin={isAdmin}
        onNavigate={navigate}
        onProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />
      <ToastStack toasts={toasts} />
      <MobileToasts toasts={toasts} />
    </div>
  );
}

export default App;
