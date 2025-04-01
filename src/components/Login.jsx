import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onLogin({ email, password });
    } catch (error) {
      console.error('Erro no login:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-sm rounded-lg p-6 w-full max-w-md border border-red-500/30">
        <h2 className="text-2xl font-bold text-red-500 mb-6 text-center drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
          Login Administrativo
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-red-500/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Digite seu email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-red-500/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              placeholder="Digite sua senha"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium text-white 
              ${isLoading 
                ? 'bg-red-500/50 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600 active:bg-red-700'} 
              transition-colors duration-200 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]`}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login; 