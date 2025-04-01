import React from 'react';

function TournamentRules() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="relative">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-red-950/90 to-black/90 backdrop-blur-md -z-10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_-20%_50%,rgba(239,68,68,0.15),transparent_50%)] -z-10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_120%_50%,rgba(239,68,68,0.15),transparent_50%)] -z-10 rounded-2xl"></div>
        
        {/* Conteúdo */}
        <div className="relative p-6 sm:p-8 border border-red-500/20 rounded-2xl space-y-8">
          {/* Pontuação */}
          <section>
            <h3 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Pontuação
            </h3>
            <div className="bg-black/30 rounded-xl p-6 space-y-4 border border-red-500/10">
              <div className="flex items-start gap-4 group hover:bg-black/20 p-4 rounded-lg transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-1">First Time Depositors (FTDs)</h4>
                  <p className="text-gray-300"><span className="text-red-400 font-medium">1 ponto</span> cada</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:bg-black/20 p-4 rounded-lg transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-1">Premiação</h4>
                  <p className="text-gray-300"><span className="text-green-400 font-medium">R$ 50.000,00</span> para o primeiro lugar</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:bg-black/20 p-4 rounded-lg transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-2xl">⛔</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-1">Práticas Proibidas</h4>
                  <p className="text-gray-300">Qualquer indício de fraude para ativação de FTD resultará na desclassificação imediata da competição e no cancelamento da afiliação.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Critérios de Validação */}
          <section>
            <h3 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Critérios de Validação
            </h3>
            <div className="bg-black/30 rounded-xl p-6 space-y-4 border border-red-500/10">
              <div className="flex items-start gap-4 group hover:bg-black/20 p-4 rounded-lg transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-1">Originalidade</h4>
                  <p className="text-gray-300">Dados devem ser <span className="text-red-400 font-medium">autênticos e verificáveis</span>. Qualquer tentativa de fraude passará por uma análise do setor responsável e se confirmado, resultará em desclassificação. Além de bloqueio da afiliação.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:bg-black/20 p-4 rounded-lg transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-1">Período e Diretrizes</h4>
                  <p className="text-gray-300">De 1º de abril até 30 de junho, com atualizações diárias.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:bg-black/20 p-4 rounded-lg transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-lg flex items-center justify-center border border-red-500/30">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-1">Revisão e Comprovação</h4>
                  <p className="text-gray-300">A equipe organizadora fará a revisão dos dados e poderá solicitar comprovações caso necessário.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TournamentRules; 