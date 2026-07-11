import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailNotice() {
  const { user, resendVerification, logout, refreshAuth } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      console.log('Focus event triggered, checking auth status...');
      
      const updatedUser = await refreshAuth(); 

      console.log('Updated user data received:', updatedUser);
  
      if (updatedUser && updatedUser.email_verified_at) {
        console.log('User is verified! Navigating to home...');
        navigate('/');
      }
    };

    window.addEventListener('focus', check);

    return () => {
      window.removeEventListener('focus', check);
    };
  }, [refreshAuth, navigate]);

  const handleResend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await resendVerification();
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Verify your email</h1>
        <p className="text-gray-600 text-sm mb-6">
          {user?.email
            ? `We sent a verification link to ${user.email}.`
            : 'We sent a verification link to your email.'}{' '}
          Click the link — this page will update automatically.
        </p>

        {status === 'sent' && (
          <p className="text-sm text-green-600 mb-4">Verification email resent — check your inbox.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-600 mb-4">Something went wrong, try again.</p>
        )}

        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-ink text-paper text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-ink-light transition disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Resend verification email'}
        </button>

        <div className="mt-4">
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}