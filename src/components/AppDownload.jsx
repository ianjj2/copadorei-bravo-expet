import React from 'react';

const AppDownload = () => {
  return (
    <div className="bg-gradient-to-b from-black/70 to-black/60 backdrop-blur-[2px] text-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto my-8 border border-red-500/30">
      <h2 className="text-2xl font-bold mb-4 text-center text-red-500">Baixar agora o nosso app!</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-red-400">Instruções para Baixar</h3>
          <h4 className="text-lg font-medium mb-2 text-red-300">Passo a passo para iOS</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Abra o Safari e acesse <a href="https://affiliates.partnersbravobet.com/" className="text-blue-400 hover:text-blue-300 underline">affiliates.partnersbravobet.com</a></li>
            <li>Toque no ícone de compartilhamento (botão Compartilhar) na parte inferior</li>
            <li>Selecione "Adicionar à Tela Inicial"</li>
            <li>Toque em "Adicionar". O ícone aparecerá na tela inicial</li>
            <li>Agora é só acessar e se divertir!</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-red-500/20">
          <p className="text-sm text-red-300">
            💡 Dica: Após instalar, você terá acesso rápido ao app diretamente da sua tela inicial!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppDownload; 