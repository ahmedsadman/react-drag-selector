import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";


function useDragSelection(targetRef, onSelectionChange) {
  const [dragStart, setDragStart] = useState(null);
  const selectionRef = useRef(null);
  
  const [dragEnd, setDragEnd] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const [selectionBox, setSelectionBox] = useState(null);
  const [showSelection, setShowSelection] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(new Set([]));
  let margin = getTargetMargin(targetRef);

  const [items, setItems] = useState([]);

  const addItem = (item) => {
    if (!item || items.includes(item)) return;
    setItems((items) => [...items, item]);
  };

  useEffect(() => {
    if (!dragStart || !dragEnd || !items) return;
    const selectionBox = calculateSelectionBox(dragStart, dragEnd);
    let newIndexes = new Set(selectedIndex);

    items.forEach((item, _i) => {
      if (!item) return;
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

  function getTargetMargin(target) {
    if (!target.current) return;
    const boundingBox = target.current.getBoundingClientRect();
    return {
      top: boundingBox.top + window.scrollY,
      left: boundingBox.left + window.scrollX,
      bottom: boundingBox.bottom + window.scrollY,
      right: boundingBox.right + window.scrollX,
    };
  }

  const calculateSelectionBox = (start, end) => ({
    left: Math.min(dragStart.x, dragEnd.x),
    top: Math.min(dragStart.y, dragEnd.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y),
  });

  const boxesIntersect = (boxA, boxB) =>
    boxA.left <= boxB.left + boxB.width &&
    boxA.left + boxA.width >= boxB.left &&
    boxA.top <= boxB.top + boxB.height &&
    boxA.top + boxA.height >= boxB.top;

  const onMouseUp = useCallback((evt) => {
    evt.preventDefault();

    setShowSelection(false);
    setSelectionBox(null);
    setIsMouseDown(false);
    resetSelection();
  }, []); 

  const onMouseDown = useCallback((evt) => {
    evt.preventDefault();
    const isValidStart = Object.values(
      isWithinTarget(evt.pageX, evt.pageY, margin),
    ).every((point) => point === true);

    if (!isValidStart) {
      return;
    }

    resetSelection();
    setShowSelection(true);

    setIsMouseDown(true);
    setDragStart({ x: evt.pageX, y: evt.pageY });
  }, [margin]); 

  const onMouseMove = useCallback((evt) => {
      evt.preventDefault();
      if (!isMouseDown) return;
  
      const isButtonPressed = !!evt.buttons;
      if (!isButtonPressed) {
        onMouseUp(evt);
        return;
      }
  
      let tempPoint = {
        x: dragEnd?.x || evt.clientX,
        y: dragEnd?.y || evt.clientY,
      };
  
      const _isWithinRange = isWithinTarget(evt.clientX, evt.clientY, margin);
  
      if (_isWithinRange.top && _isWithinRange.bottom) {
        tempPoint.y = evt.clientY;
      }
  
      if (_isWithinRange.left && _isWithinRange.right) {
        tempPoint.x = evt.clientX;
      }
  
      setDragEnd(tempPoint);
  }, [dragEnd, isMouseDown, margin, onMouseUp]);

  const isWithinTarget = (pageX, pageY, margin) => {
    return {
      left: pageX - margin.left >= 0,
      top: pageY - margin.top >= 0,
      right: margin.right - pageX >= 0,
      bottom: margin.bottom - pageY >= 0,
    };
  };

  const resetSelection = () => {
    setDragStart(null);
    setDragEnd(null);
    setSelectedIndex(new Set([]));
  };

  let selectionStyles = useMemo(() => {
    let selectionStyles = {
      position: "absolute",
      zIndex: 100,
      border: "1px solid red",
      display: showSelection ? "inline-block" : "none",
    };

    if (selectionBox) {
      selectionStyles = {
        ...selectionStyles,
        ...selectionBox,
      };
    }

    return selectionStyles;
  }, [showSelection, selectionBox]);

  // TODO: Create separate component and pass props instead of capturing values from scope
  const DragSelection = useCallback(
    () => (
      <div
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}

        style={{
          height: "100vh",
          width: "100vw",
          top: 0,
          left: 0,
          position: "absolute",
        }}>
        <div ref={selectionRef} style={selectionStyles}></div>
      </div>
    ),
    [selectionStyles, onMouseDown, onMouseMove, onMouseUp],
  );

  return {
    DragSelection,
    addItem,
  };
}

export default useDragSelection;
