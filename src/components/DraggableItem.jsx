import React, { useRef, useEffect } from 'react';
import { Move } from 'lucide-react';

export default function DraggableItem({
  children,
  position,
  onDrag,
  label,
  active = false,
  onClick,
}) {
  const itemRef = useRef(null);

  const handlePointerDown = (e) => {
    // Only drag with left click
    if (e.button !== undefined && e.button !== 0) return;
    
    // Stop event propagation to avoid triggering page selection
    e.stopPropagation();
    
    // Call onClick to set active item
    if (onClick) onClick();

    const element = itemRef.current;
    if (!element) return;

    const parent = element.offsetParent;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Compute original offsets in percentage
    const handlePointerMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      // Calculate new position in percentage relative to parent container
      // Subtract half element width/height to center the drag point
      let newX = ((clientX - parentRect.left - elementRect.width / 2) / parentRect.width) * 100;
      let newY = ((clientY - parentRect.top - elementRect.height / 2) / parentRect.height) * 100;

      // Clamp between 0% and 100%
      newX = Math.max(0, Math.min(100 - (elementRect.width / parentRect.width) * 100, newX));
      newY = Math.max(0, Math.min(100 - (elementRect.height / parentRect.height) * 100, newY));

      onDrag({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  };

  return (
    <div
      ref={itemRef}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        cursor: 'move',
        userSelect: 'none',
        touchAction: 'none',
      }}
      className={`group select-none z-20 transition-shadow ${
        active 
          ? 'ring-2 ring-google-blue ring-offset-1 rounded shadow-lg bg-white/10' 
          : 'hover:ring-1 hover:ring-slate-300 hover:rounded'
      }`}
    >
      {/* Visual handle shown on hover/active */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 active:opacity-100 transition-opacity whitespace-nowrap z-30">
        <Move className="h-2 w-2" />
        {label}
      </div>

      {children}
    </div>
  );
}
