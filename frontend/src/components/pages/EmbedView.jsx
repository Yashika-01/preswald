// src/pages/EmbedView.jsx
import React, { useEffect, useState } from 'react';

import DynamicComponents from '@/components/DynamicComponents';
import LoadingState from '@/components/LoadingState';

import { comm } from '@/utils/websocket';

const EmbedView = () => {
  const embedId = window.__EMBED_ID__ || null;
  const [components, setComponents] = useState({ rows: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    comm.connect();

    const unsubscribe = comm.subscribe((message) => {
      switch (message.type) {
        case 'connection_status':
          setIsConnected(message.connected);
          break;

        case 'components':
          let rows = message.components.rows || [];
          if (embedId) {
            // filter to only the one component
            rows = rows
              .map((row) => row.filter((c) => c.id === embedId))
              .filter((row) => row.length > 0);
          }
          setComponents({ rows });
          setLoading(false);
          break;

        case 'error':
          setError(message.content.message);
          setLoading(false);
          break;

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
      comm.disconnect();
    };
  }, [embedId]);

  if (!isConnected || loading) {
    return <LoadingState isConnected={isConnected} />;
  }

  if (error) {
    return <div className="embed-error">{error}</div>;
  }

  if (components.rows.length === 0) {
    return (
      <div className="embed-empty">
        <p>No component found to embed{embedId ? ` (id: ${embedId})` : ''}.</p>
      </div>
    );
  }

  // We disable updates in embed mode
  const noop = () => {};

  return (
    <div className="embed-container">
      <DynamicComponents components={components} onComponentUpdate={noop} />
    </div>
  );
};

export default EmbedView;
