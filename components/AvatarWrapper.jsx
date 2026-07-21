'use client';

import dynamic from 'next/dynamic';

// Dynamically import AvatarDisplay with SSR disabled
const AvatarDisplay = dynamic(
  () => import('./AvatarDisplay'),
  { 
    ssr: false,
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading avatar...</div>
  }
);

export default function AvatarWrapper(props) {
  return <AvatarDisplay {...props} />;
}