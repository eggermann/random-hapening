// components/LiveFeed.js
import React from 'react';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

export default function LiveFeed({ liveContent, contentEndRef }) {
  return (
    <div className="flex-grow overflow-y-auto border rounded-md p-2 mb-4 h-96">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {liveContent.map((item) => (
          <div key={item.id} className="p-2 border rounded-md mb-2 break-words">
            {item.type === 'chat' && <p className="text-sm">{item.text}</p>}
            {item.type === 'photo' && <img src={item.url} alt="Content" className="w-full h-auto rounded-md" />}
            {item.type === 'video' && <video src={item.url} controls className="w-full h-auto rounded-md" />}
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={contentEndRef} />
      </Masonry>
    </div>
  );
}
