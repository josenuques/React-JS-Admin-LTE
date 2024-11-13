import React from 'react';

const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div className="loading-spinner">
        <i className="fas fa-circle-notch fa-spin fa-3x text-white"></i>
      </div>
    </div>
  );
};

export default LoadingOverlay;