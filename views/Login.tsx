
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (data: any, isGuest?: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, fullName, phoneNumber, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] px-6 py-12 relative overflow-hidden">
      {/* Animated Glowing Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-naija-green opacity-20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-naija-green opacity-10 blur-[150px] rounded-full"></div>
      <div className="absolute top-[20%] right-[5%] w-32 h-32 bg-yellow-500 opacity-5 blur-[80px] rounded-full"></div>

      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-24 h-16 flex mb-6 shadow-[0_0_30px_rgba(0,135,81,0.3)] rounded-lg overflow-hidden border-2 border-white/20">
            <div className="bg-naija-green w-1/3 h-full"></div>
            <div className="bg-white w-1/3 h-full flex items-center justify-center text-2xl">🇳🇬</div>
            <div className="bg-naija-green w-1/3 h-full"></div>
          </div>
          <h1 className="font-brand font-black text-6xl tracking-tighter text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            MONEY<span className="text-naija-green">11</span>
          </h1>
          <p className="mt-3 text-sm text-gray-400 font-bold tracking-[0.3em] uppercase">Play & Earn Nigeria</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl border border-white/10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-naija-green focus:border-transparent transition-all outline-none"
                    placeholder="Chidi Obi"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-naija-green focus:border-transparent transition-all outline-none"
                    placeholder="080 1234 5678"
                  />
                </div>
              </>
            )}

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-naija-green focus:border-transparent transition-all outline-none"
                placeholder="chidi@example.com"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-naija-green focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-naija-green text-white py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,135,81,0.3)] mt-6 uppercase tracking-wider"
            >
              {isRegistering ? 'Join the Squad' : 'Enter Arena'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              {isRegistering ? 'Already a member? Sign In' : "New player? Create Profile"}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#050505] text-gray-500 uppercase font-black tracking-widest text-[10px]">Fast Lane</span></div>
        </div>

        <button
          onClick={() => onLogin({}, true)}
          className="w-full bg-white/5 border-2 border-dashed border-white/10 text-gray-400 py-5 rounded-3xl font-black hover:border-naija-green hover:text-white transition-all uppercase tracking-widest text-xs"
        >
          Continue as Guest
        </button>
        
        <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-tighter mt-4">
          By entering, you agree to play responsibly. 🇳🇬
        </p>
      </div>
    </div>
  );
};

export default Login;
