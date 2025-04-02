import React, { useState, useEffect, lazy, Suspense } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TournamentRules from './components/TournamentRules';
import AppDownload from './components/AppDownload';
import { auth, participants } from './supabase';
import BravoLogo from './components/BravoLogo';

function TechBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: 'url(/background.jpg)' }}
      />
      
      {/* Base gradient overlay - Minimal opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/20" />
      
      {/* Grid pattern - Very subtle */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>
      
      {/* Glowing orbs - Subtle effect */}
      <div className="absolute top-1/4 -left-20 w-60 h-60 bg-red-500 rounded-full filter blur-[100px] opacity-10 animate-pulse" />
      <div className="absolute top-3/4 -right-20 w-60 h-60 bg-red-800 rounded-full filter blur-[100px] opacity-10 animate-pulse delay-1000" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center">
        {/* Logo animada */}
        <img 
          src="/Logo.png" 
          alt="Bravo.bet" 
          className="h-32 md:h-40 mb-8 animate-bounce-slow filter drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" 
        />
        
        {/* Spinner duplo */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin-reverse"></div>
          </div>
        </div>
        
        {/* Texto de loading com efeito de digitação */}
        <div className="mt-6 text-center">
          <p className="text-red-500 text-lg font-medium animate-pulse">
            Carregando
            <span className="animate-ellipsis">.</span>
            <span className="animate-ellipsis animation-delay-300">.</span>
            <span className="animate-ellipsis animation-delay-600">.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [participantsList, setParticipantsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('classification');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const PARTICIPANTS_PER_PAGE = 1000;

  // Detectar mudanças no estado de tela cheia
  useEffect(() => {
    const checkFullScreen = () => {
      const isFS = document.fullscreenElement || 
                  document.webkitFullscreenElement || 
                  document.mozFullScreenElement ||
                  document.msFullscreenElement;
      setIsFullScreen(!!isFS);
    };

    const handleF11 = (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!isFullScreen) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };

    document.addEventListener('fullscreenchange', checkFullScreen);
    document.addEventListener('webkitfullscreenchange', checkFullScreen);
    document.addEventListener('mozfullscreenchange', checkFullScreen);
    document.addEventListener('MSFullscreenChange', checkFullScreen);
    document.addEventListener('keydown', handleF11);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullScreen);
      document.removeEventListener('webkitfullscreenchange', checkFullScreen);
      document.removeEventListener('mozfullscreenchange', checkFullScreen);
      document.removeEventListener('MSFullscreenChange', checkFullScreen);
      document.removeEventListener('keydown', handleF11);
    };
  }, [isFullScreen]);

  const loadParticipants = async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await participants.getAll(1, 1000);
      setParticipantsList(data);
      setHasMore(false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadParticipants(1);
  }, [activeTab]);

  const handleLogin = async (credentials) => {
    try {
      await auth.signIn(credentials.email, credentials.password);
      setIsAuthenticated(true);
      setShowLogin(false);
    } catch (error) {
      console.error('Erro no login:', error.message);
      alert('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro no logout:', error.message);
    }
  };

  const handleAddParticipant = async (newParticipant) => {
    try {
      await participants.add(newParticipant);
      await loadParticipants(); // Recarregar lista atualizada
    } catch (error) {
      console.error('Erro ao adicionar participante:', error.message);
      alert('Erro ao adicionar participante.');
    }
  };

  const handleUpdateParticipant = async (updatedParticipant) => {
    try {
      await participants.update(updatedParticipant.id, updatedParticipant);
      await loadParticipants(); // Recarregar lista atualizada
    } catch (error) {
      console.error('Erro ao atualizar participante:', error.message);
      alert('Erro ao atualizar participante.');
    }
  };

  const handleDeleteParticipant = async (participantId) => {
    try {
      await participants.delete(participantId);
      await loadParticipants(); // Recarregar lista atualizada
    } catch (error) {
      console.error('Erro ao deletar participante:', error.message);
      alert('Erro ao deletar participante.');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <TechBackground />
      
      {/* Header - Com transição suave para tela cheia */}
      <div className={`fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-b border-red-500/10 z-40 transition-all duration-500 ${isFullScreen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <BravoLogo 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLoginClick={() => setShowLogin(true)}
        />
      </div>
      
      {/* Login Modal */}
      {showLogin && !isAuthenticated && (
        <Login onLogin={handleLogin} />
      )}

      {/* Admin Dashboard */}
      {isAuthenticated && (
        <AdminDashboard
          participants={participantsList}
          onUpdateParticipant={handleUpdateParticipant}
          onAddParticipant={handleAddParticipant}
          onDeleteParticipant={handleDeleteParticipant}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Main Content - Com ajuste de padding para tela cheia */}
      <main className={`relative w-full text-white transition-all duration-500 ${isFullScreen ? 'pt-4' : 'pt-28 sm:pt-32'} pb-8 px-4 sm:px-6 lg:px-8 z-10`}>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'rules' ? (
            <>
              <div className="text-center relative mb-16 animate-fade-in">
                <h1 className="title-bravo text-3xl sm:text-4xl md:text-5xl animate-gradient-x">
                  REGRAS DO TORNEIO
                </h1>
              </div>
              <TournamentRules />
            </>
          ) : activeTab === 'app' ? (
            <>
              <div className="text-center relative mb-16 animate-fade-in">
                <h1 className="title-bravo text-3xl sm:text-4xl md:text-5xl animate-gradient-x">
                  APLICATIVO MÓVEL
                </h1>
              </div>
              <AppDownload />
            </>
          ) : (
            <>
              <div className="text-center relative mb-16 animate-fade-in">
                <img 
                  src="/Logo2site.png" 
                  alt="RANK - BRAVO.BET.BR"
                  className="h-16 sm:h-20 md:h-24 mx-auto filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)] hover:drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] transition-all duration-500"
                  loading="eager"
                  decoding="sync"
                />
              </div>

              {/* Top 3 Section */}
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-16 px-4 pt-4 pb-8 max-w-4xl mx-auto">
                {/* Second Place */}
                {participantsList.length > 1 && (
                  <div className="w-[100px] sm:w-[200px] max-w-[240px] animate-slide-in-left shrink-0 hover:z-30">
                    <div className="rounded-lg p-2 sm:p-3 text-center transform hover:scale-105 transition-all duration-300 border border-amber-500/50 hover:border-amber-400 group hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold px-3 py-0.5 rounded-full text-xs shadow-lg shadow-amber-500/30 animate-pulse">#2</div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                        <img
                          src="/Perfil.png"
                          alt={participantsList[1].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xs sm:text-lg font-bold text-amber-400 mb-0.5 group-hover:text-amber-300 truncate px-1">{participantsList[1].name}</h3>
                      <p className="text-[10px] sm:text-sm text-amber-500/90 mb-1 truncate">{participantsList[1].tag}</p>
                      <div className="bg-black/30 rounded-lg p-1 sm:p-2 group-hover:bg-black/20">
                        <p className="text-sm sm:text-xl font-bold text-amber-400 group-hover:text-amber-300">{participantsList[1].points}</p>
                        <p className="text-[10px] text-amber-500/90">FTDs</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* First Place */}
                {participantsList[0] && (
                  <div className="w-[120px] sm:w-[240px] max-w-[280px] z-20 transform transition-all duration-500 hover:scale-105 shrink-0 hover:z-30">
                    <div className="bg-gradient-to-b from-black/70 to-black/60 backdrop-blur-[2px] rounded-lg p-2 sm:p-3 text-center transform hover:scale-105 transition-all duration-300 border-[1px] border-transparent relative group hover:from-black/60 hover:to-black/50 rainbow-border">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <svg className="w-7 h-7 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/>
                        </svg>
                      </div>
                      <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-3 bg-gradient-to-br from-red-500 to-red-700 rounded-full overflow-hidden border-4 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]">
                        <img 
                          src="/Perfil.png"
                          alt={participantsList[0].name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-red-400 group-hover:text-red-300 mb-1 truncate px-1">{participantsList[0].name}</h3>
                      <p className="text-xs sm:text-sm text-red-500/90 mb-2 truncate">{participantsList[0].tag}</p>
                      <div className="bg-black/30 rounded-lg p-2 group-hover:bg-black/20">
                        <p className="text-base sm:text-lg font-bold text-red-500 group-hover:text-red-400">{participantsList[0].points}</p>
                        <p className="text-xs text-red-500/90">FTDs</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-1 group-hover:bg-black/20">
                        <p className="text-[10px] sm:text-base font-bold text-green-400 group-hover:text-green-300 drop-shadow-[0_0_3px_rgba(74,222,128,0.5)]">R$ 50.000 MIL REAIS</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Third Place */}
                {participantsList[2] && (
                  <div className="w-[100px] sm:w-[200px] max-w-[240px] transform transition-all duration-500 hover:scale-105 shrink-0 hover:z-30">
                    <div className="rounded-lg p-2 sm:p-3 text-center transform hover:scale-105 transition-all duration-300 border border-red-500/50 hover:border-red-400 group hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold px-3 py-0.5 rounded-full text-xs shadow-lg shadow-amber-500/30 animate-pulse">#3</div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                        <img
                          src="/Perfil.png"
                          alt={participantsList[2].name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-xs sm:text-lg font-bold text-amber-400 mb-0.5 group-hover:text-amber-300 truncate px-1">{participantsList[2].name}</h3>
                      <p className="text-[10px] sm:text-sm text-amber-500/90 mb-1 truncate">{participantsList[2].tag}</p>
                      <div className="bg-black/30 rounded-lg p-1 sm:p-2 group-hover:bg-black/20">
                        <p className="text-sm sm:text-xl font-bold text-amber-400 group-hover:text-amber-300">{participantsList[2].points}</p>
                        <p className="text-[10px] text-amber-500/90">FTDs</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ranking Table with animation */}
              <div className="relative overflow-hidden rounded-lg animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-red-950/90 to-black/90 backdrop-blur-md -z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_-20%_50%,rgba(239,68,68,0.15),transparent_50%)] -z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_120%_50%,rgba(239,68,68,0.15),transparent_50%)] -z-10"></div>
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-block relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 rounded-lg blur"></div>
                      <p className="relative text-sm sm:text-base md:text-lg font-medium tracking-wider uppercase bg-gradient-to-r from-red-200 via-red-300 to-red-200 text-transparent bg-clip-text">
                        Classificação até o TOP 50
                      </p>
                      <div className="absolute h-px w-full bottom-0 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0"></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                          <tr className="bg-black/40">
                            <th className="sticky top-0 px-2 sm:px-6 py-2 sm:py-4 text-left">
                              <span className="flex items-center text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]">
                                <span className="text-sm sm:text-lg ranking-name">#</span>
                              </span>
                            </th>
                            <th className="sticky top-0 px-2 sm:px-6 py-2 sm:py-4 text-left flex-1">
                              <span className="flex items-center text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                                <span className="text-xs sm:text-base hidden sm:inline ranking-name">Usuário</span>
                              </span>
                            </th>
                            <th className="sticky top-0 px-2 sm:px-6 py-2 sm:py-4 text-center min-w-[100px]">
                              <span className="flex items-center justify-center text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span className="text-xs sm:text-base hidden sm:inline ranking-name">FTDs</span>
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-900/30">
                          {participantsList.slice(3).map((participant, index) => (
                            <tr 
                              key={participant.id} 
                              className="hover:bg-red-950/50 transition-colors"
                            >
                              <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                <span className="text-red-500 font-medium text-sm sm:text-base drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] ranking-name">#{participant.position}</span>
                              </td>
                              <td className="px-2 sm:px-6 py-2 sm:py-4 flex-1">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full mr-3 overflow-hidden bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30">
                                    <img
                                      src="/Perfil.png"
                                      alt={participant.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-0">
                                      <p className="text-sm font-medium text-red-100/90 truncate ranking-name uppercase tracking-wide">
                                        {participant.name}
                                      </p>
                                      <p className="text-[11px] text-red-400/70 truncate ranking-name tracking-tight">
                                        {participant.tag}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 sm:px-6 py-2 sm:py-4 text-center whitespace-nowrap min-w-[100px]">
                                <span className="font-bold text-red-500 text-sm sm:text-base drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] ranking-name">{participant.points}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 