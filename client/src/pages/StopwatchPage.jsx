import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 秒表页面
 * 状态流转：
 *   - idle（初始）    : 只显示播放按钮，时间固定 00:00.00
 *   - running（运行）  : 计时中，显示暂停 + 重置
 *   - paused（暂停）   : 计时停止，显示继续 + 重置
 */
function StopwatchPage() {
  // --- 状态 ---
  const [elapsed, setElapsed] = useState(0);       // 已流逝的毫秒数
  const [status, setStatus] = useState('idle');    // 'idle' | 'running' | 'paused'

  // --- refs（避免在 render 中重新创建） ---
  const timerRef = useRef(null);                   // setInterval 句柄
  const startTimeRef = useRef(0);                  // 最近一次开始/继续的时间戳

  /**
   * 将毫秒数格式化为 MM:SS.xx
   * MM  = 总分钟数（不限 59，纯累计）
   * SS  = 剩余秒数 (0-59)
   * xx  = 百分秒（毫秒 / 10 取整）
   */
  const formatTime = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (n, len = 2) => String(n).padStart(len, '0');

    return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }, []);

  /**
   * 清除定时器（公共方法）
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * 启动计时器：每 10ms 更新一次显示（约百分秒精度）
   */
  const startTimer = useCallback(() => {
    // 记录本次开始的时间戳
    startTimeRef.current = performance.now();

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 10);
    }, 10);
  }, []);

  /**
   * 处理【开始/继续】点击
   */
  const handlePlay = useCallback(() => {
    setStatus('running');
    startTimer();
  }, [startTimer]);

  /**
   * 处理【暂停】点击：清除定时器，保留当前 elapsed
   */
  const handlePause = useCallback(() => {
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  /**
   * 处理【重置】点击：清零并回到初始状态
   */
  const handleReset = useCallback(() => {
    clearTimer();
    setElapsed(0);
    setStatus('idle');
  }, [clearTimer]);

  /**
   * 清理：组件卸载时确保定时器清除
   */
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // --- 渲染 ---
  return (
    <div>
      <div className="page-title">{'\u{23F1}'} 秒表</div>

      {/* 时间显示卡片 */}
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <div
          style={{
            fontSize: '4rem',
            fontWeight: 700,
            color: '#667eea',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}
        >
          {formatTime(elapsed)}
        </div>
      </div>

      {/* 按钮控制区 */}
      <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
        {status === 'idle' && (
          /* ====== 初始状态：仅播放 ====== */
          <button onClick={handlePlay} className="btn btn-primary">
            {'\u25B6'} 开始
          </button>
        )}

        {status === 'running' && (
          /* ====== 运行中：暂停 + 重置 ====== */
          <>
            <button onClick={handlePause} className="btn btn-primary" style={{ marginRight: '0.8rem' }}>
              {'\u23F8'} 暂停
            </button>
            <button onClick={handleReset} className="btn btn-danger">
              {'\u21BB'} 重置
            </button>
          </>
        )}

        {status === 'paused' && (
          /* ====== 已暂停：继续 + 重置 ====== */
          <>
            <button onClick={handlePlay} className="btn btn-success" style={{ marginRight: '0.8rem' }}>
              {'\u25B6'} 继续
            </button>
            <button onClick={handleReset} className="btn btn-danger">
              {'\u21BB'} 重置
            </button>
          </>
        )}
      </div>

      {/* 提示 */}
      <div style={{ textAlign: 'center', color: '#aaa', fontSize: '0.82rem', marginTop: '0.8rem' }}>
        精确到百分秒（1/100 秒）
      </div>
    </div>
  );
}

export default StopwatchPage;
