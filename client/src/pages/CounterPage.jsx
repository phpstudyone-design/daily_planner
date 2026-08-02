import React, { useState, useEffect, useRef } from 'react';

function CounterPage() {
  const [count, setCount] = useState(0);
  const [btnLabel, setBtnLabel] = useState('+');
  const inputRef = useRef(null);

  // Update button label based on count
  useEffect(() => {
    if (count === 1) {
      setBtnLabel('+1!');
    } else if (count === 10) {
      setBtnLabel('\u{1F389}');
    } else {
      setBtnLabel('+');
    }
  }, [count]);

  // Sync count from manual input
  const syncCountFromInput = () => {
    const raw = inputRef.current;
    if (!raw) return;
    const newValue = parseInt(raw.value, 10);
    if (!Number.isNaN(newValue) && newValue >= 0) {
      setCount(newValue);
    } else {
      raw.value = count;
    }
  };

  const increment = () => {
    setCount(prev => prev + 1);
  };

  const decrement = () => {
    setCount(prev => (prev > 0 ? prev - 1 : 0));
  };

  // Keyboard shortcuts when focus is NOT on the input
  useEffect(() => {
    const handler = (event) => {
      if (document.activeElement === inputRef.current) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        increment();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        decrement();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div>
      <div className="page-title">{'\u{1F522}'} 计数器</div>

      {/* Count display card */}
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: '#667eea', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
          {count}
        </div>
      </div>

      {/* Counter button */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
        <button
          onClick={increment}
          className="btn btn-primary"
          style={{
            fontSize: '3rem',
            lineHeight: 1,
            fontWeight: 700,
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.35)',
          }}
        >
          {btnLabel}
        </button>
      </div>

      {/* Manual input card */}
      <div className="card" style={{ textAlign: 'center', padding: '1.2rem 1.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>
          手动设置值
        </label>
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={count}
          onChange={(e) => { setCount(Math.max(0, parseInt(e.target.value, 10) || 0)) }}
          onBlur={syncCountFromInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              syncCountFromInput();
            }
          }}
          style={{
            width: '120px',
            textAlign: 'center',
            fontSize: '1.2rem',
            padding: '0.4rem 0.6rem',
          }}
        />
      </div>

      {/* Hint */}
      <div style={{ textAlign: 'center', color: '#aaa', fontSize: '0.82rem', marginTop: '0.8rem' }}>
        回车 +1 · Backspace -1 · 直接输入数字，失焦或回车确认
      </div>
    </div>
  );
}

export default CounterPage;