import React, { useState, useEffect } from 'react';

function useDragSelection() {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(true);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showSelection, setShowSelection] = useState(false);

  const calculateSelectionBox = (start, end) => ({
    left: Math.min(dragStart.x, dragEnd.x),
    top: Math.min(dragStart.y, dragEnd.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y)
  });

  const onMouseMove = (evt) => {
    evt.preventDefault();
    if (!isMouseDown) return;
    setDragEnd({ x: evt.pageX, y: evt.pageY });
  };

  const onMouseUp = (evt) => {
    evt.preventDefault();
    removeHandlers();
    setShowSelection(false);
    setSelectionBox(null);
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
    setDragStart({ x: evt.pageX, y: evt.pageY });

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
      setSelectionBox(calculateSelectionBox(dragStart, dragEnd));
    }
  }, [dragStart, dragEnd]);

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