import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Smartphone,
  Lock
} from 'lucide-react';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  mfaEnabled: boolean;
  onConfirmMfa: () => void;
}

export const MFAModal: React.FC<MFAModalProps> = ({
  isOpen,
  onClose,
  mfaEnabled,
  onConfirmMfa
}) => {
  if (!isOpen) return null;

  const [otpCode, setOtpCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      setSuccess(true);
      setError(false);
      setTimeout(() => {
        onConfirmMfa();
        onClose();
      }, 1000);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d121c] border border-[#c5a059]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#e5c98a]">
              <KeyRound className="w-4 h-4" />
            </span>
            <h3 className="font-serif-luxury text-base font-bold text-slate-100">
              Enterprise Multi-Factor Authentication
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Multi-Factor Authentication enforces cryptographic verification before overriding physical building access locks or exporting sensitive high-net-worth client datasets.
          </p>

          <div className="p-4 rounded-xl bg-[#080b12] border border-[#1e2638] flex flex-col items-center justify-center space-y-3">
            <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center border-2 border-[#c5a059]">
              <QrCode className="w-28 h-28 text-black" />
            </div>
            <span className="font-tech text-[10px] text-slate-400">
              KEY: <strong className="text-[#e5c98a]">AURA-9821-SEC-7201-TOTP</strong>
            </span>
          </div>

          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Enter 6-Digit Authenticator Token
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''));
                  setError(false);
                }}
                placeholder="e.g. 583921"
                className="w-full text-center tracking-[0.5em] font-tech text-lg py-2.5 bg-[#080b12] border border-[#1e2638] rounded-xl text-[#e5c98a] placeholder-slate-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {error && (
              <p className="text-rose-400 text-[11px] text-center">
                Please enter a valid 6-digit code.
              </p>
            )}

            {success && (
              <p className="text-emerald-400 text-[11px] text-center flex items-center justify-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> MFA Token Verified Successfully!
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#8c6d32] text-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#c5a059]/10"
            >
              <ShieldCheck className="w-4 h-4" />
              {mfaEnabled ? 'Re-Verify MFA Token' : 'Enable & Enforce 2FA'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
