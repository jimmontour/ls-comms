import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  return (
    <div className="link-tree-settings">
      <div className="settings-header">
        <SettingsIcon size={32} />
        <h1>Link Tree Settings</h1>
      </div>

      <div className="settings-card">
        <h2>Global Settings</h2>
        <p>Configure default styles and behavior for all your link trees.</p>
        
        <div className="setting-group">
          <label>Default Brand Color</label>
          <input type="color" defaultValue="#34d399" />
        </div>

        <div className="setting-group">
          <label>Analytics Enabled</label>
          <input type="checkbox" defaultChecked />
        </div>
      </div>

      <div className="settings-card">
        <h2>Coming Soon</h2>
        <p>More customization options will be available soon:</p>
        <ul>
          <li>Custom CSS</li>
          <li>Font selection</li>
          <li>Button styles</li>
          <li>SEO settings</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
