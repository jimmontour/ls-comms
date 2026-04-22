import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import Layout from '../components/Layout';
import { useSearchParams } from 'react-router-dom';

interface ConnectedAccount {
  _id: string;
  platform: string;
  accountName: string;
  connectedAt: string;
}

const Settings: React.FC = () => {
  const { token } = useAuth();
  const { request, loading } = useApi(token);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [teamId, setTeamId] = useState(localStorage.getItem('teamId') || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      setSuccessMessage(`Successfully connected ${connected}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (teamId && token) {
      loadAccounts();
    }
  }, [teamId, token]);

  const loadAccounts = async () => {
    try {
      const data = await request('GET', `/accounts/${teamId}`);
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts', err);
    }
  };

  const handleConnect = async (platform: string) => {
    // Redirect to OAuth endpoint with JWT token
    const oauthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/${platform}?token=${token}&state=${teamId}`;
    window.location.href = oauthUrl;
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await request('DELETE', `/accounts/${accountId}`);
      setAccounts(accounts.filter(a => a._id !== accountId));
    } catch (err) {
      console.error('Failed to disconnect account', err);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon size={32} className="text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-500/30 rounded flex items-center gap-2 text-emerald-200">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {/* Connected Accounts */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Connected Accounts</h2>

          {accounts.length === 0 ? (
            <p className="text-gray-400 mb-6">No accounts connected yet. Connect your first account to get started.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {accounts.map(account => (
                <div key={account._id} className="flex items-center justify-between border border-gray-700 rounded p-4">
                  <div>
                    <p className="text-white font-medium capitalize">{account.platform}</p>
                    <p className="text-gray-400 text-sm">{account.accountName}</p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(account._id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Connect New Account */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-300 text-sm font-medium mb-4">Connect more accounts</p>
            <div className="grid grid-cols-2 gap-3">
              {['facebook', 'instagram', 'x', 'linkedin'].map(platform => (
                <button
                  key={platform}
                  onClick={() => handleConnect(platform)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 text-white px-4 py-2 rounded transition capitalize"
                >
                  <Plus size={16} />
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
