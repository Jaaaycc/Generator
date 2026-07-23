"use client";  // <-- Add this at the top// components/AvatarManager.jsx
import { useState } from 'react';

export default function AvatarManager() {
  const [voiceFile, setVoiceFile] = useState(null);
  const [faceFile, setFaceFile] = useState(null);
  const [voiceId, setVoiceId] = useState('');
  const [faceId, setFaceId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', 'MyVoice'); // You can make this dynamic

    const res = await fetch('/api/wunjo/voice', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.voice_id) {
      setVoiceId(data.voice_id);
      alert(`Voice cloned successfully! ID: ${data.voice_id}`);
    } else {
      alert('Cloning failed: ' + JSON.stringify(data));
    }
    setLoading(false);
  };

  const handleFaceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', 'MyFace');

    const res = await fetch('/api/wunjo/face', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.face_id) {
      setFaceId(data.face_id);
      alert(`Face uploaded successfully! ID: ${data.face_id}`);
    } else {
      alert('Upload failed: ' + JSON.stringify(data));
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">🎭 My Avatar Setup</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Upload */}
        <div className="p-4 border border-dashed border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold text-white">🎤 Clone Your Voice</h3>
          <p className="text-sm text-gray-400 mb-2">Upload a 10-30 sec WAV/MP3 file</p>
          <input 
            type="file" 
            accept=".wav,.mp3,.m4a" 
            onChange={handleVoiceUpload} 
            className="text-white w-full"
          />
          {voiceId && <p className="text-green-400 mt-2">✅ Voice ID: {voiceId}</p>}
        </div>

        {/* Face Upload */}
        <div className="p-4 border border-dashed border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold text-white">📸 Upload Your Face</h3>
          <p className="text-sm text-gray-400 mb-2">Upload a clear front-facing JPG/PNG</p>
          <input 
            type="file" 
            accept=".jpg,.jpeg,.png" 
            onChange={handleFaceUpload} 
            className="text-white w-full"
          />
          {faceId && <p className="text-green-400 mt-2">✅ Face ID: {faceId}</p>}
        </div>
      </div>

      {loading && <p className="text-yellow-400 mt-4">⏳ Processing...</p>}
      
      {/* Save to local storage / use in your Sales Chat */}
      {(voiceId || faceId) && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <p className="text-gray-300">You can now use these IDs in your Sales Chat component:</p>
          <pre className="bg-black p-2 rounded text-green-400 text-sm">
            {`voiceId="${voiceId || 'YOUR_VOICE_ID'}"`}<br />
            {`faceId="${faceId || 'YOUR_FACE_ID'}"`}
          </pre>
        </div>
      )}
    </div>
  );
}