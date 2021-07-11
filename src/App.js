import React, { useEffect, useState } from 'react';
import useDragSelection from './useDragSelection';
import './App.css';

function App() {
  const [selectedIndexes, setSelectedIndexes] = useState(new Set([]));

  const handleSelection = (indexes) => {
    setSelectedIndexes(indexes);
  };

  const { DragSelection } = useDragSelection(handleSelection);

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 20; i++) {
      const boxStyle = {
        backgroundColor: selectedIndexes.has(i) ? 'gray' : 'white'
      }
      const box = <div className='box' style={boxStyle} key={i} data-draggable={true}>Box</div>;
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
