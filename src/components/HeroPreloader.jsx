import React from 'react';

import './HeroPreloader.css';

function HeroPreloader({ active, progress, canSkip, onSkip, backgroundUrl }) {
  return (
    <div
      className={`heroPreloader${active ? ' is-active' : ''}`}
      aria-hidden={!active}
      style={{ backgroundImage: `url("${backgroundUrl}")` }}
    >
      <div className="heroPreloaderStatus">
        <span className="heroPreloaderPercent" aria-hidden="true">{progress}%</span>
        <span
          className="heroPreloaderA11y"
          role="progressbar"
          aria-label="3D 模型加载进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        />
        {active && canSkip && (
          <button type="button" onClick={onSkip}>直接进入</button>
        )}
      </div>
    </div>
  );
}

export default HeroPreloader;
