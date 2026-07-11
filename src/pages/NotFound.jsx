import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-display text-6xl text-ink mb-2">404</p>
        <p className="text-gray-500 mb-6">This page doesn't exist.</p>
        <Link to="/" className="text-sm font-medium text-gold-dark hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}