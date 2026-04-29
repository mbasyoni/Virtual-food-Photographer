/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ApiKeyScreen } from './components/ApiKeyScreen';
import { MainApp } from './components/MainApp';

export default function App() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasSelected = await window.aistudio.hasSelectedApiKey();
        setHasKey(hasSelected);
      } catch (e) {
        console.error('Failed to check API key:', e);
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  if (hasKey === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasKey) {
    return <ApiKeyScreen onKeySelected={() => setHasKey(true)} />;
  }

  return <MainApp />;
}

