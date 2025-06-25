// components/ContentShareForm.js
import React from 'react';

export default function ContentShareForm({ currentEvent, isInside, chatInput, setChatInput, handleSendChat, handleUploadMedia }) {
  if (!currentEvent) {
    return <p className="text-center text-gray-500">No active event to share content.</p>;
  }

  if (!isInside) {
    return <p className="text-center text-gray-500">Move closer to the event to share content!</p>;
  }

  return (
    <div className="content-share mt-auto">
      <h3 className="content-share__title text-lg font-semibold mb-2">Share Content / Chat</h3>
      <div className="content-share__row flex mb-2">
        <input
          type="text"
          className="content-share__input flex-grow border rounded-l-md p-2 text-sm"
          placeholder="Type your message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') handleSendChat(); }}
        />
        <button
          onClick={handleSendChat}
          className="content-share__button bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 text-sm"
        >
          Send
        </button>
      </div>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleUploadMedia}
        className="content-share__file w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm cursor-pointer"
      />
    </div>
  );
}
