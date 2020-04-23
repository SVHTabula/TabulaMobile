import React, { useState, useEffect, useRef, useContext } from 'react';
import CanvasContext from "./context/canvas";
import SocketContext from "./context/socket";

import { v4 } from 'uuid';
const userId = v4();
const line = [];

const canvasRef = React.createRef();

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export default function DrawingCanvas() {
  const isDragModeRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isPaintingRef = useRef(false);
  const prevPosRef = useRef({ offsetX: 0, offsetY: 0 });

  const { lineWidthRef, lineColorRef } = useContext(CanvasContext);
  const { socket } = useContext(SocketContext);

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  function loadImage(url) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = url;
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
  }

  useEffect(() => {
    canvasRef.current.width = windowDimensions.width;
    canvasRef.current.height = windowDimensions.height;
  }, [windowDimensions]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    socket.on("paint", (data) => {
      const {userId: id, line} = data;
      if (id !== userId) {
        line.forEach((position) => {
          paint(position.start, position.stop);
        });
      }
    });

    socket.on("updateImage", (imageUrl) => {
      loadImage(imageUrl);
    });

    socket.on("setPhoneBounds", (bounds) => {
      const {x, y} = bounds;
      canvasRef.current.marginLeft = x;
      canvasRef.current.marginTop = y;
    });

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function getOffsets(targetTouches) {
    const canvas = canvasRef.current;
    const x = canvas.offsetLeft;
    const y = canvas.offsetTop;
    const offsetX = targetTouches[0].clientX - x;
    const offsetY = targetTouches[0].clientY - y;
    return { offsetX, offsetY };
  }

  function onTouchStart({ targetTouches }) {
    prevPosRef.current = getOffsets(targetTouches);
    if (isDragModeRef.current) {
      isDraggingRef.current = true;
    } else {
      isPaintingRef.current = true;
    }
  }

  function paint(prevPos, currPos) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = lineColorRef.current;
    ctx.lineWidth = lineWidthRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    prevPosRef.current = { offsetX, offsetY };
  }

  function dragTo(currPos) {
    const { offsetX, offsetY } = currPos;

    socket.emit('setPhoneBounds', {
      width: window.innerWidth,
      height: window.innerHeight,
      x: offsetX,
      y: offsetY
    });

    prevPosRef.current = { offsetX, offsetY };
  }

  function onTouchMove({ targetTouches }) {
    if (isPaintingRef.current || isDraggingRef.current) {
      const {offsetX, offsetY} = getOffsets(targetTouches);
      const offSetData = {offsetX, offsetY};
      const position = {
        start: {...prevPosRef.current},
        stop: {...offSetData},
      };
      line.push(position);
      if (isPaintingRef.current) {
        paint(prevPosRef.current, offSetData);
      } else if (isDraggingRef.current) {
        dragTo(offSetData);
      }
    }
  }

  function onTouchEnd() {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      socket.emit('paint', {line, userId});
      line.splice(0, line.length);
    } else if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  }

  return (
    <canvas
      ref={canvasRef}
      id="drawingCanvas"
      style={{ background: 'black' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );

}
