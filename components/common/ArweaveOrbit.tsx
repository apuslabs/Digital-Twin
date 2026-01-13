import React from "react";

const styles = `
.wrapper {
  height: 24px;
  width: 24px;
  position: absolute;
  transform-style: preserve-3d;
  animation: rotate 2s infinite linear;
}
 
@media (min-width: 768px) {
  .wrapper {
    height: 32px;
    width: 32px;
  }
}
 
.container {
  height: 28px;
  width: 28px;
  position: relative;
}
 
@media (min-width: 768px) {
  .container {
    height: 40px;
    width: 40px;
  }
}
 
.coin {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 50%;
  background: #ffffff;
}
 
.outer {
  transform: translateZ(1px);
}
 
@media (min-width: 768px) {
  .outer {
    transform: translateZ(2px);
  }
}
 
.front {
  transform: translateZ(1px);
}
 
@media (min-width: 768px) {
  .front {
    transform: translateZ(2px);
  }
}
 
.front.inner {
  background: #e5e7eb;
  transform: rotateY(180deg) translateZ(-1px);
}
 
@media (min-width: 768px) {
  .front.inner {
    transform: rotateY(180deg) translateZ(-2px);
  }
}
 
.back.inner {
  background: #e5e7eb;
  transform: translateZ(-1px);
}
 
@media (min-width: 768px) {
  .back.inner {
    transform: translateZ(-2px);
  }
}
 
.back {
  transform: rotateY(180deg) translateZ(1px);
}
 
@media (min-width: 768px) {
  .back {
    transform: rotateY(180deg) translateZ(2px);
  }
}
 
.coin-side {
  position: absolute;
  border-radius: 0;
  transform: translateX(11px) rotateY(90deg);
  width: 2px;
  height: 24px;
  background: #e5e7eb;
}
 
@media (min-width: 768px) {
  .coin-side {
    transform: translateX(15px) rotateY(90deg);
    width: 4px;
    height: 32px;
  }
}
 
@keyframes rotate {
  to {
    transform: rotateY(360deg);
  }
}
`;

export default function ArweaveOrbit() {
  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <div className="wrapper">
          <div className="coin-side" />
        </div>
        <div className="wrapper">
          <div className="coin outer front">
            <ArweaveIcon />
          </div>
          <div className="coin inner front" />
          <div className="coin outer back">
            <ArweaveIcon />
          </div>
          <div className="coin inner back" />
        </div>
      </div>
    </>
  );
}

function ArweaveIcon() {
  return (
    <svg viewBox="0 0 31.8 31.8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15.9" cy="15.9" r="14.7" fill="none" stroke="#222326" strokeWidth="2.5"/>
      <path d="M18.7,21.2c-0.1-0.1-0.1-0.3-0.2-0.5c0-0.2-0.1-0.4-0.1-0.6c-0.2,0.2-0.4,0.3-0.6,0.5c-0.2,0.2-0.5,0.3-0.7,0.4  c-0.3,0.1-0.5,0.2-0.9,0.3c-0.3,0.1-0.7,0.1-1,0.1c-0.6,0-1.1-0.1-1.6-0.3c-0.5-0.2-0.9-0.4-1.3-0.7c-0.4-0.3-0.6-0.7-0.8-1.1  c-0.2-0.4-0.3-0.9-0.3-1.4c0-1.2,0.5-2.2,1.4-2.8c0.9-0.7,2.3-1,4.1-1h1.7v-0.7c0-0.6-0.2-1-0.5-1.3c-0.4-0.3-0.9-0.5-1.6-0.5  c-0.6,0-1,0.1-1.3,0.4c-0.3,0.3-0.4,0.6-0.4,1h-3c0-0.5,0.1-1,0.3-1.4c0.2-0.4,0.5-0.8,1-1.2c0.4-0.3,0.9-0.6,1.5-0.8  c0.6-0.2,1.3-0.3,2.1-0.3c0.7,0,1.3,0.1,1.9,0.3c0.6,0.2,1.1,0.4,1.6,0.8c0.4,0.3,0.8,0.8,1,1.3c0.2,0.5,0.4,1.1,0.4,1.8v5  c0,0.6,0,1.1,0.1,1.5c0.1,0.4,0.2,0.8,0.3,1v0.2H18.7z M15.8,19.1c0.3,0,0.6,0,0.8-0.1c0.3-0.1,0.5-0.2,0.7-0.3  c0.2-0.1,0.4-0.2,0.5-0.4c0.1-0.1,0.3-0.3,0.4-0.4v-2h-1.5c-0.5,0-0.9,0-1.2,0.1c-0.3,0.1-0.6,0.2-0.8,0.4c-0.2,0.2-0.4,0.3-0.5,0.6  c-0.1,0.2-0.1,0.5-0.1,0.7c0,0.4,0.1,0.7,0.4,1C14.8,19,15.3,19.1,15.8,19.1z" fill="#222326"/>
    </svg>
  );
}
