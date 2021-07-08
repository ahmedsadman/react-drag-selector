import React, { useEffect, useState } from 'react';
import useDragSelection from './useDragSelection';
import './App.css';

function App() {
  const { DragSelection } = useDragSelection();

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 20; i++) {
      const box = <div className='box' key={i} data-draggable={true}>Box</div>;
      boxes.push(box);
    }
    return boxes;
  }

  return (
    <div className='container'>
      <DragSelection />
      {renderBoxes()}
    </div>
  );
}

export default App;
