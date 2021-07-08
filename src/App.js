import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(true);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showSelection, setShowSelection] = useState(false);

  const calculateBox = (aX, aY, bX, bY) => {
    const x = Math.abs(aX - bX);
    const y = Math.abs(aY - bY);

    console.log('size', x, y);
    return [x, y];
  }

  const onMouseMove = (evt) => {
    evt.preventDefault();
    if (!isMouseDown) return;
    console.log('is moving');
    setDragEnd([evt.pageX, evt.pageY]);
  };

  const onMouseUp = (evt) => {
    evt.preventDefault();
    removeHandlers();
    setShowSelection(false);
    setIsMouseDown(false);
  }

  const onMouseDown = (evt) => {
    evt.preventDefault();
    if (evt.target.dataset.draggable) {
      return;
    }

    resetSelection();
    setShowSelection(true);
    
    setIsMouseDown(true);
    setDragStart([evt.pageX, evt.pageY]);

    registerHandlers();
  };

  const registerHandlers = () => {
    window.document.addEventListener('mouseup', onMouseUp, false);
    window.document.addEventListener('mousemove', onMouseMove, false);
  };

  const removeHandlers = () => {
    window.document.removeEventListener('mouseup', onMouseUp, false);
    window.document.removeEventListener('mousemove', onMouseMove, false);
  }

  const bind = () => {
    window.document.addEventListener('mousedown', onMouseDown, false);
  };

  const reset = () => {
    window.document.removeEventListener('mousedown', onMouseDown, false);
  };

  const resetSelection = () => {
    setDragStart(null);
    setDragEnd(null);
  }

  useEffect(() => {
    reset();
    bind();

    setIsMouseDown(true);

    return () => {
      reset();
    }
  }, [isMouseDown]);

  useEffect(() => {
    if (dragStart && dragEnd) {
      const [width, height] = calculateBox(dragEnd[0], dragEnd[1], dragStart[0], dragStart[1]);
      console.log(width, height);
      setSelectionBox({
        left: `${Math.min(dragStart[0], dragEnd[0])}px`,
        top: `${Math.min(dragStart[1], dragEnd[1])}px`,
        width: `${width}px`,
        height: `${height}px`
      });
    }
  }, [dragStart, dragEnd]);

  let selectionStyles = {
    position: 'absolute',
    zIndex: -10,
    border: '1px solid red',
    display: showSelection ? 'inline-block' : 'none'
  }

  if (selectionBox) {
    selectionStyles = {
      ...selectionStyles,
      ...selectionBox
    }
  }

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 20; i++) {
      const box = <div className='box' data-draggable={true}>Box</div>;
      boxes.push(box);
    }
    return boxes;
  }

  return (
    <div className='container'>
      <div style={selectionStyles}></div>
      {renderBoxes()}
    </div>
  );
}

export default App;
