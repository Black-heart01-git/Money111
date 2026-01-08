
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (phone: string, isGuest?: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    onLogin(phoneNumber);
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Phone Number (080...)</label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +234
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 block w-full border border-gray-300 rounded-none rounded-r-lg px-4 py-3 focus:ring-naija-green focus:border-naija-green transition-all"
                      placeholder="8012345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-naija-green focus:border-naija-green transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 text-center">Enter 4-digit OTP sent to {phoneNumber}</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-4 block w-full border border-gray-300 rounded-lg px-4 py-4 text-center text-3xl tracking-widest font-bold focus:ring-naija-green focus:border-naija-green transition-all"
                  placeholder="0000"
                />
                <button 
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="mt-4 text-xs text-naija-green font-bold text-center w-full uppercase"
                >
                  Change Phone Number
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-naija-green text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg shadow-green-200"
            >
              {otpSent ? 'Verify & Continue' : (isRegistering ? 'Register' : 'Login')}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-sm font-semibold text-gray-500 hover:text-naija-green transition-colors"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 text-gray-500">OR</span></div>
        </div>

        <button
          onClick={() => onLogin('Guest', true)}
          className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-xl font-bold hover:border-naija-green hover:text-naija-green transition-all"
        >
          Continue as Guest (Free Only)
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">
          By continuing, you agree to MONEY11's Terms of Service and confirm you are 18+.
          <br/>Gambling can be addictive. Please play responsibly.
        </p>
      </div>
    </div>
  );
};

export default Login;
