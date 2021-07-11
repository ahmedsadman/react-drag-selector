import React, { useState, useEffect, useRef } from 'react';

function useDragSelection(targetRef, onSelectionChange) {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  /* Event listeners cannot react on state values. To fix this, we can use 'useRef'
  which allows to handle the latest values in event listeners. Whichever state value is 
  directly used in the event listeners should be handled this way */
  const [isMouseDown, _setIsMouseDown] = useState(false);
  const isMouseDownRef = useRef(isMouseDown);

  const [selectionBox, setSelectionBox] = useState(null);
  const [showSelection, setShowSelection] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(new Set([]));
  let margin = { top: 0, left: 0 };
  const items = document.querySelectorAll('.box');

  const setIsMouseDown = (data) => {
    isMouseDownRef.current = data;
    _setIsMouseDown(data);
  };

  useEffect(() => {
    registerHandlers();
    getTargetMargin(targetRef);

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

  const getTargetMargin = (target) => {
    if (!target.current) return;
    const boundingBox = target.current.getBoundingClientRect();
    margin = {
      top: boundingBox.top + window.scrollY,
      left: boundingBox.left + window.scrollX,
      bottom: boundingBox.bottom + window.scrollY,
      right: boundingBox.right + window.scrollX
    };
  }

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
    if (!isMouseDownRef.current || !isWithinTarget(evt.pageX, evt.pageY, margin)) return;
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
    if (evt.target.dataset.draggable || !isWithinTarget(evt.pageX, evt.pageY, margin)) {
      return;
    }

    console.log('pagex pagey', evt.pageX, evt.pageY);
    console.log('target margin', margin);

    resetSelection();
    setShowSelection(true);
    
    setIsMouseDown(true);
    setDragStart({ x: evt.pageX, y: evt.pageY });
  };

  const isWithinTarget = (pageX, pageY, margin) => {
    const x1 = pageX - margin.left;
    const y1 =  pageY - margin.top;
    const x2 = margin.right - pageX;
    const y2 = margin.bottom - pageY;

    return x1 >= 0 && y1 >= 0 && x2 >= 0 && y2 >= 0;
  }

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