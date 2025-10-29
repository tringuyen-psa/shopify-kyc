'use client'

import { useState } from 'react';

export default function EditEmailButton() {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');

  const handleSave = async () => {
    // TODO: Implement email update logic
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEmail('');
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter new email"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
    >
      Edit email
    </button>
  );
}