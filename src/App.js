import React, { useRef, useState } from 'react';
import useDragSelection from './useDragSelection';
import './App.css';

function App() {
  const targetRef = useRef(null);
  const [selectedIndexes, setSelectedIndexes] = useState(new Set([]));

  const handleSelection = (indexes) => {
    setSelectedIndexes(indexes);
  };

  const { DragSelection } = useDragSelection(targetRef, handleSelection);

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
    <div className='container' ref={targetRef}>
      <DragSelection />
      {renderBoxes()}
    </div>
  );
}

export default App;
