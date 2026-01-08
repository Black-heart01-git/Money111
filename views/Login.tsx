
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-24 h-16 flex mb-6 shadow-xl rounded-lg overflow-hidden border-4 border-white">
            <div className="bg-naija-green w-1/3 h-full"></div>
            <div className="bg-white w-1/3 h-full flex items-center justify-center text-2xl">🇳🇬</div>
            <div className="bg-naija-green w-1/3 h-full"></div>
          </div>
          <h1 className="font-brand font-black text-5xl tracking-tighter text-naija-green">MONEY11</h1>
          <p className="mt-2 text-sm text-gray-600 font-medium tracking-wide uppercase">Play & Earn Nigeria</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-naija-green focus:border-naija-green"
                    placeholder="Chidi Obi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-naija-green focus:border-naija-green"
                    placeholder="080 1234 5678"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-naija-green focus:border-naija-green"
                placeholder="chidi@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-naija-green focus:border-naija-green"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-naija-green text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg shadow-green-200 mt-4"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-semibold text-gray-500 hover:text-naija-green transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 text-gray-500 uppercase font-bold tracking-widest text-[10px]">Quick Access</span></div>
        </div>

        <button
          onClick={() => onLogin({}, true)}
          className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-bold hover:border-naija-green hover:text-naija-green transition-all"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
