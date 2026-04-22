import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useSearchParams } from 'react-router-dom';
import './Settings.css';

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

  const handleConnect = (platform: string) => {
    const baseUrl = 'http://localhost:5000';
    const oauthUrl = `${baseUrl}/auth/${platform}?token=${token}&state=${teamId}`;
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

  const platforms = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'twitter', label: 'X' },
    { id: 'linkedin', label: 'LinkedIn' }
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <SettingsIcon size={32} />
        <h1>Settings</h1>
      </div>

      {successMessage && (
        <div className="success-alert">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="settings-card">
        <h2>Connected Accounts</h2>

        {accounts.length === 0 ? (
          <p className="empty-accounts">No accounts connected yet. Connect your first account to get started.</p>
        ) : (
          <div className="accounts-list">
            {accounts.map(account => (
              <div key={account._id} className="account-item">
                <div className="account-info">
                  <p className="account-platform">{account.platform}</p>
                  <p className="account-name">{account.accountName}</p>
                </div>
                <button
                  onClick={() => handleDisconnect(account._id)}
                  className="disconnect-btn"
                  title="Disconnect account"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="connect-section">
          <label className="connect-label">Connect more accounts</label>
          <div className="platforms-buttons">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => handleConnect(platform.id)}
                disabled={loading}
                className="connect-btn"
              >
                <Plus size={16} />
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
