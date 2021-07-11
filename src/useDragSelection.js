import React, { useState, useEffect, useRef } from 'react';

function useDragSelection(onSelectionChange) {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(true);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showSelection, setShowSelection] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(new Set([]));
  const items = document.querySelectorAll('.box');

  useEffect(() => {
    registerHandlers();

    return () => {
      removeHandlers();
    }
  }, []);

  useEffect(() => {
    if (!dragStart || !dragEnd) return; 
    const selectionBox = calculateSelectionBox(dragStart, dragEnd);
    let newIndexes = new Set(selectedIndex);

    items.forEach((item, _i) => {
      const itemBox = item.getBoundingClientRect();
      const isIntersecting = boxesIntersect(selectionBox, itemBox);

      if (isIntersecting && !selectedIndex.has(_i)) {
        newIndexes.add(_i);
      } else if (!isIntersecting && selectedIndex.has(_i)) {
        newIndexes.delete(_i);
      }
    });

    setSelectedIndex(newIndexes);
    onSelectionChange(newIndexes);
    setSelectionBox(selectionBox);
  }, [dragStart, dragEnd]);

  const calculateSelectionBox = (start, end) => ({
    left: Math.min(dragStart.x, dragEnd.x),
    top: Math.min(dragStart.y, dragEnd.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y)
  });

  const boxesIntersect = (boxA, boxB) => (
    boxA.left <= boxB.left + boxB.width &&
    boxA.left + boxA.width >= boxB.left &&
    boxA.top <= boxB.top + boxB.height &&
    boxA.top + boxA.height >= boxB.top
  );
    

  const onMouseMove = (evt) => {
    evt.preventDefault();
    if (!isMouseDown) return;
    setDragEnd({ x: evt.pageX, y: evt.pageY });
  };

  const onMouseUp = (evt) => {
    evt.preventDefault();
    setShowSelection(false);
    setSelectionBox(null);
    setIsMouseDown(false);
    resetSelection();
  }

  const onMouseDown = (evt) => {
    evt.preventDefault();
    if (evt.target.dataset.draggable) {
      return;
    }

    resetSelection();
    setShowSelection(true);
    
    setIsMouseDown(true);
    setDragStart({ x: evt.pageX, y: evt.pageY });
  };

  const registerHandlers = () => {
    window.document.addEventListener('mousedown', onMouseDown);
    window.document.addEventListener('mouseup', onMouseUp);
    window.document.addEventListener('mousemove', onMouseMove);
    console.log('successfully registered event handlers');
  };

  const removeHandlers = () => {
    window.document.removeEventListener('mousedown', onMouseDown);
    window.document.removeEventListener('mouseup', onMouseUp);
    window.document.removeEventListener('mousemove', onMouseMove);
    console.log('cleaned up event handlers');
  }

  const resetSelection = () => {
    setDragStart(null);
    setDragEnd(null);
    setSelectedIndex(new Set([]));
  }

  let selectionStyles = {
    position: 'absolute',
    zIndex: 100,
    border: '1px solid red',
    display: showSelection ? 'inline-block' : 'none'
  }

  if (selectionBox) {
    selectionStyles = {
      ...selectionStyles,
      ...selectionBox
    }
  }

  const DragSelection = () => (
    <div style={selectionStyles}></div>
  );

  return { 
    DragSelection
  }
}

export default useDragSelection;