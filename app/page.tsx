'use client';
import React, { useState, useRef, useEffect } from 'react';
import '@fontsource/quicksand/500.css';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0); // in degrees
  const [isSpinning, setIsSpinning] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [spinSpeed, setSpinSpeed] = useState(4); // Speed in seconds (1-10)
  const [wheelSize, setWheelSize] = useState(500);
  const [winner, setWinner] = useState<string | null>(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showSpinMessage, setShowSpinMessage] = useState(true);
  const [isIdleSpinning, setIsIdleSpinning] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  // For textarea entries
  const [entriesText, setEntriesText] = useState('Ali\nBeatriz\nCharles\nDiya\nEric\nFatima\nGabriel\nHanna');
  // Add a spin animation state
  const [spinAnim, setSpinAnim] = useState<null | {
    start: number;
    duration: number;
    from: number;
    to: number;
    winnerIdx: number;
  }>(null);
  // Tab state: 'entries' or 'results'
  const [activeTab, setActiveTab] = useState<'entries' | 'results'>('entries');
  // Results list
  const [results, setResults] = useState<string[]>([]);

// Handle responsive wheel sizing
useEffect(() => {
  const updateWheelSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) { // sm breakpoint
      setWheelSize(300); // Adjusted for smaller screens
    } else if (screenWidth < 768) { // md breakpoint
      setWheelSize(400); // Adjusted for medium screens
    } else if (screenWidth < 1024) { // lg breakpoint
      setWheelSize(450); // Adjusted for large screens
    } else {
      setWheelSize(500); // Default large size
    }
  };

  updateWheelSize();
  window.addEventListener('resize', updateWheelSize);
  return () => window.removeEventListener('resize', updateWheelSize);
}, []);

  // Keep segments in sync with textarea
  useEffect(() => {
    setSegments(entriesText.split(/\r?\n/).filter(line => line.trim() !== ''));
  }, [entriesText]);

  const addSegment = () => {
    if (inputValue.trim() && segments.length < 12) {
      setSegments([...segments, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const createSlicePath = (index: number, totalSegments: number) => {
    const anglePerSegment = 360 / totalSegments;
    const startAngle = index * anglePerSegment;
    const endAngle = (index + 1) * anglePerSegment;

    const centerX = wheelSize / 2;
    const centerY = wheelSize / 2;
    const radius = wheelSize / 2;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = anglePerSegment > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number, totalSegments: number) => {
    const anglePerSegment = 360 / totalSegments;
    const midAngle = (index * anglePerSegment + anglePerSegment / 2) * Math.PI / 180;
    const textRadius = wheelSize * 0.31;

    const x = wheelSize / 2 + textRadius * Math.cos(midAngle);
    const y = wheelSize / 2 + textRadius * Math.sin(midAngle);

    return { x, y, rotation: (index * anglePerSegment + anglePerSegment / 2) };
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 2) return 'Very Fast';
    if (speed <= 3) return 'Fast';
    if (speed <= 5) return 'Normal';
    if (speed <= 7) return 'Slow';
    return 'Very Slow';
  };

const getWheelFontSize = () => {
  return Math.max(12, wheelSize * 0.05); // Increased base size to 12 and scaling factor to 0.05
};

  const getTextLimit = () => {
    if (wheelSize < 300) return 6;
    if (wheelSize < 350) return 8;
    return 10;
  };

  // Color and textColor logic for dynamic segments
const wheelColors = [
  { color: '#000000', textColor: '#FFFFFF' }, // Black with white text
  { color: '#FFFFFF', textColor: '#000000' }  // White with black text
];

  // Helper to get color for a segment index, avoiding consecutive duplicates
  function getWheelColor(idx: number, segments: string[]): { color: string; textColor: string; colorIdx: number } {
    let colorIdx = idx % wheelColors.length;
    // Avoid consecutive duplicates by checking all previous assignments
    if (idx > 0) {
      let prevColorIdx = -1;
      for (let i = 0; i < idx; i++) {
        prevColorIdx = getWheelColorSimple(i);
        if (i === idx - 1 && colorIdx === prevColorIdx) {
          colorIdx = (colorIdx + 1) % wheelColors.length;
        }
      }
    }
    return { ...wheelColors[colorIdx], colorIdx };
  }

  function getWheelColorSimple(idx: number): number {
    return idx % wheelColors.length;
  }

  // Helper for SVG arc path
  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = {
      x: cx + r * Math.cos((Math.PI / 180) * startAngle),
      y: cy + r * Math.sin((Math.PI / 180) * startAngle)
    };
    const end = {
      x: cx + r * Math.cos((Math.PI / 180) * endAngle),
      y: cy + r * Math.sin((Math.PI / 180) * endAngle)
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
    ].join(' ');
  }

  // Helper for segment path (pie slice)
  function describeSegment(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = {
      x: cx + r * Math.cos((Math.PI / 180) * startAngle),
      y: cy + r * Math.sin((Math.PI / 180) * startAngle)
    };
    const end = {
      x: cx + r * Math.cos((Math.PI / 180) * endAngle),
      y: cy + r * Math.sin((Math.PI / 180) * endAngle)
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      'Z'
    ].join(' ');
  }

  // Fireworks component
  const Fireworks = () => {
    const fireworksRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!fireworksRef.current) return;

      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      const fireworksContainer = fireworksRef.current;

      // Create multiple firework bursts
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          createFirework(fireworksContainer, colors);
        }, i * 200);
      }
    }, []);

    const createFirework = (container: HTMLElement, colors: string[]) => {
      const firework = document.createElement('div');
      firework.className = 'firework';
      
      // Random position
      const x = Math.random() * 80 + 10; // 10% to 90% of screen width
      const y = Math.random() * 60 + 20; // 20% to 80% of screen height
      
      firework.style.position = 'absolute';
      firework.style.left = `${x}%`;
      firework.style.top = `${y}%`;
      firework.style.pointerEvents = 'none';
      
      container.appendChild(firework);

      // Create particles
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        
        const angle = (i * 30) * Math.PI / 180;
        const velocity = 50 + Math.random() * 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 6px ${color}`;
        
        const deltaX = Math.cos(angle) * velocity;
        const deltaY = Math.sin(angle) * velocity;
        
        particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        particle.style.opacity = '1';
        particle.style.transition = 'all 1s ease-out';
        
        firework.appendChild(particle);
        
        // Animate particle
        setTimeout(() => {
          particle.style.transform = `translate(${deltaX * 2}px, ${deltaY * 2 + 50}px)`;
          particle.style.opacity = '0';
        }, 50);
      }

      // Remove firework after animation
      setTimeout(() => {
        if (container.contains(firework)) {
          container.removeChild(firework);
        }
      }, 1500);
    };

    return <div ref={fireworksRef} className="absolute inset-0 pointer-events-none z-30" />;
  };

  useEffect(() => {
    // Optionally, hide the message after first spin in the future
    setShowSpinMessage(true);
    setIsIdleSpinning(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate the angle for each segment
  const segmentAngle = segments.length > 0 ? 360 / segments.length : 0;

  // ABSOLUTE: Only this function can trigger a spin.
  function handleSpin() {
    if (isSpinning || segments.length < 2) return;
    setIsIdleSpinning(false);
    setIsSpinning(true);
    setShowSpinMessage(false);
    setWinner(null);
    setShowWinnerModal(false);
    setConfetti(false);
    // Calculate the spin
    const randomIdx = Math.floor(Math.random() * segments.length);
    const randomOffset = Math.random() * segmentAngle;
    const from = currentAngle;
    const to = from + 360 * 5 + (360 - (randomIdx * segmentAngle + randomOffset));
    setSpinAnim({
      start: performance.now(),
      duration: 4000,
      from,
      to,
      winnerIdx: randomIdx
    });
  }

  // Spin animation effect
  useEffect(() => {
    if (!spinAnim) return;
    let stopped = false;
    function animate(now: number) {
      if (stopped) return;
      // Destructure spinAnim inside the animation frame to avoid linter errors
      const anim = spinAnim;
      if (!anim) return;
      const { start, duration, from, to, winnerIdx } = anim;
      const elapsed = Math.min(now - start, duration);
      // Ease-out cubic
      const t = elapsed / duration;
      const eased = 1 - Math.pow(1 - t, 3);
      const angle = from + (to - from) * eased;
      setCurrentAngle(angle);
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(segments[winnerIdx]);
        setShowWinnerModal(true);
        setConfetti(true);
        setCurrentAngle(((to % 360) + 360) % 360);
        setSpinAnim(null);
      }
    }
    requestAnimationFrame(animate);
    return () => { stopped = true; };
  }, [spinAnim, segments]);

  // Remove winner (first instance)
  function removeWinner() {
    if (!winner) return;
    const lines = entriesText.split(/\r?\n/);
    const idx = lines.findIndex(line => line.trim() === winner);
    if (idx !== -1) {
      lines.splice(idx, 1);
      setEntriesText(lines.join('\n'));
    }
    setShowWinnerModal(false);
    setConfetti(false);
  }
  // Remove all winner instances
  function removeAllWinner() {
    if (!winner) return;
    const lines = entriesText.split(/\r?\n/).filter(line => line.trim() !== winner);
    setEntriesText(lines.join('\n'));
    setShowWinnerModal(false);
    setConfetti(false);
  }
  // Close modal
  function closeWinnerModal() {
    setShowWinnerModal(false);
    setConfetti(false);
  }

  useEffect(() => {
    if (isIdleSpinning && !isSpinning) {
      let raf: number;
      let last = performance.now();
      const spinIdle = (now: number) => {
        const delta = now - last;
        last = now;
        setCurrentAngle(a => (a + (delta * 360) / 10000) % 360); // 36deg/sec
        raf = requestAnimationFrame(spinIdle);
      };
      raf = requestAnimationFrame(spinIdle);
      return () => cancelAnimationFrame(raf);
    }
  }, [isIdleSpinning, isSpinning]);

  // When a winner is chosen, add to results
  useEffect(() => {
    if (winner) {
      setResults(prev => [...prev, winner]);
    }
  }, [winner]);

  // Sort results
  const sortResults = () => {
    setResults(prev => [...prev].sort((a, b) => a.localeCompare(b)));
  };
  // Clear results
  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'dark' : ''}`} style={{ backgroundColor: darkMode ? '#181818' : '#ffffff' }}>
      {/* Blue Navbar */}
      <nav className="w-full bg-[#4285F4] flex items-center px-4 py-2 gap-4 shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
            {/* Placeholder logo SVG */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#FBBC05"/><circle cx="14" cy="14" r="9" fill="#EA4335"/><circle cx="14" cy="14" r="5" fill="#34A853"/></svg>
          </div>
          <span className="text-white text-lg font-bold ml-2">wheelofnames.com</span>
        </div>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Action buttons */}
        <div className="flex items-center gap-2 text-white text-sm font-medium">
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="palette">🎨</span>Customize</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="new">📄</span>New</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="open">📂</span>Open</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="save">💾</span>Save</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="share">🔗</span>Share</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="gallery">🖼️</span>Gallery</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="more">⋯</span>More</button>
          <button className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"><span role="img" aria-label="language">🌐</span>English</button>
          {/* Dark Mode Toggle Button */}
          <button 
            className="flex items-center gap-1 px-2 py-1 hover:bg-blue-600 rounded transition"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span role="img" aria-label="dark mode">{darkMode ? "☀️" : "🌙"}</span>
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center w-full max-w-full relative overflow-hidden">
        {/* Wheel Section */}
       <section className="flex flex-col items-center justify-center py-8" style={{ width: '100%', height: '100%', maxWidth: '100vw', maxHeight: '100vh' }}>
  {/* SVG Wheel */}
  <div
    className="relative flex items-center justify-center mx-auto"
    style={{
      width: `min(800px, 90vw)`, // Increased max width to 800px
      height: `min(800px, 90vw)`, // Increased max height to 800px
      maxWidth: '90vw',
      maxHeight: '90vh',
      cursor: isSpinning || segments.length < 2 ? 'not-allowed' : 'pointer',
    }}
    onClick={handleSpin}
    title={segments.length < 2 ? 'Add at least 2 options to spin' : 'Click to spin the wheel'}
  >
    {/* Confetti */}
    {confetti && <ConfettiEffect />}
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${wheelSize} ${wheelSize}`} // Uses dynamic wheelSize
      style={{ transform: `rotate(${currentAngle}deg)` }}
    >
      <defs>
        <radialGradient id="wheelGradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={darkMode ? '#fff' : '#000'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={darkMode ? '#000' : '#fff'} stopOpacity="0.10" />
        </radialGradient>
        {segments.map((name, i) => {
          const segAngle = 360 / segments.length;
          const startAngle = i * segAngle;
          const endAngle = (i + 1) * segAngle;
          return (
            <path
              key={i}
              id={`arc-text-${i}`}
              d={describeArc(wheelSize / 2, wheelSize / 2, wheelSize / 2 - 75, startAngle + 2, endAngle - 2)} // Adjusted radius
              fill="none"
            />
          );
        })}
        {/* Message arcs: top and bottom */}
        <path id="spin-msg-top" d={describeArc(wheelSize / 2, wheelSize / 2, wheelSize / 2 - 160, 200, -20)} fill="none" />
        <path id="spin-msg-bottom" d={describeArc(wheelSize / 2, wheelSize / 2, wheelSize / 2 - 160, 20, 160)} fill="none" />
      </defs>
      {/* Wheel background with gradient */}
      <circle cx={wheelSize / 2} cy={wheelSize / 2} r={wheelSize / 2} fill="url(#wheelGradient)" />
      {/* Segments */}
      {segments.map((name, i) => {
        const segAngle = 360 / segments.length;
        const startAngle = i * segAngle;
        const endAngle = (i + 1) * segAngle;
        const color = getWheelColor(i, segments).color;
        return (
          <path
            key={i}
            d={describeSegment(wheelSize / 2, wheelSize / 2, wheelSize / 2, startAngle, endAngle)}
            fill={color}
          />
        );
      })}
      {/* Center white circle */}
      <circle cx={wheelSize / 2} cy={wheelSize / 2} r="75" fill={darkMode ? '#fff' : '#000'} /> {/* Increased radius from 55 to 75 */}
     {/* Radially Rotated Straight Text */}
{segments.map((name, i) => {
  const { textColor } = getWheelColor(i, segments);
  const segAngle = 360 / segments.length;
  const midAngle = (i * segAngle + segAngle / 2) * Math.PI / 180;
  const textRadius = wheelSize * 0.31; // Distance from center
  const x = wheelSize / 2 + textRadius * Math.cos(midAngle);
  const y = wheelSize / 2 + textRadius * Math.sin(midAngle);
  
  // Calculate rotation angle to align with radial direction
  const rotationAngle = (i * segAngle + segAngle / 2);
  
  return (
    <text
      key={i}
      x={x}
      y={y}
      fill={textColor}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="35"
      fontWeight="bold"
      transform={`rotate(${rotationAngle}, ${x}, ${y})`}
    >
      {name}
    </text>
  );
})}
    </svg>
    {/* Pointer on right center */}
    <div
      className="absolute"
      style={{
        top: '50%',
        right: '-24px', // Increased from -18px
        transform: 'translateY(-50%)',
        zIndex: 20,
      }}
    >
      <div className="w-0 h-0 border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent border-r-[48px] border-r-white"></div> {/* Increased sizes */}
    </div>
  </div>
</section>

        {/* Sidebar Section */}
        <aside
          className="w-[340px] min-h-[540px] border rounded-2xl shadow-lg flex flex-col px-4 pt-4 pb-2 absolute right-8 top-1/2"
          style={{ transform: 'translateY(-50%)' }}
        >
          {sidebarHidden ? (
            <div className="flex justify-end items-center h-10">
              <label className="flex items-center gap-1 text-xs font-bold pb-1 px-2 cursor-pointer select-none" style={{ height: '32px' }}>
                <input
                  type="checkbox"
                  className="align-middle"
                  checked={sidebarHidden}
                  onChange={(e) => setSidebarHidden(e.target.checked)}
                  style={{ accentColor: darkMode ? '#23272b' : '#d1d5db' }}
                />
                Hide
              </label>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center mb-3 gap-2">
                <button
                  className={`font-bold text-base pb-1 px-1 focus:outline-none border-b-2 ${activeTab === 'entries' ? 'border-blue-500' : 'border-transparent'} ${darkMode ? 'text-white' : 'text-black'}`}
                  onClick={() => setActiveTab('entries')}
                >
                  Entries <span className="rounded px-2 text-xs font-normal">{segments.length}</span>
                </button>
                <button
                  className={`font-bold text-base pb-1 px-1 ml-4 focus:outline-none border-b-2 ${activeTab === 'results' ? 'border-blue-500' : 'border-transparent'} ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('results')}
                >
                  Results <span className="rounded px-2 text-xs font-normal">{results.length}</span>
                </button>
                <label className="flex items-center gap-1 text-xs font-bold pb-1 px-2 cursor-pointer select-none ml-4" style={{ height: '32px' }}>
                  <input
                    type="checkbox"
                    className="align-middle"
                    checked={sidebarHidden}
                    onChange={(e) => setSidebarHidden(e.target.checked)}
                    style={{ accentColor: darkMode ? '#23272b' : '#d1d5db' }}
                  />
                  Hide
                </label>
              </div>
              {/* Tab content */}
              {activeTab === 'entries' ? (
                <>
                  {/* Controls */}
                  <div className="flex gap-2 mb-2">
                    <button className={`flex items-center gap-1 text-white px-3 py-1.5 rounded text-xs font-semibold transition ${darkMode ? 'bg-[#23272b] hover:bg-[#222]' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke={darkMode ? '#fff' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 6h16M4 18h16"/></svg>
                      Shuffle
                    </button>
                    <button className={`flex items-center gap-1 text-white px-3 py-1.5 rounded text-xs font-semibold transition ${darkMode ? 'bg-[#23272b] hover:bg-[#222]' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke={darkMode ? '#fff' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18"/></svg>
                      Sort
                    </button>
                    <button className={`flex items-center gap-1 text-white px-3 py-1.5 rounded text-xs font-semibold transition ${darkMode ? 'bg-[#23272b] hover:bg-[#222]' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke={darkMode ? '#fff' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>
                      Add image
                    </button>
                  </div>
                  <div className="mb-2">
                    <label className={`text-xs select-none cursor-pointer ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}><input type="checkbox" className="mr-1 align-middle"/>Advanced</label>
                  </div>
                  {/* Entry List as textarea */}
                  <div className={`flex-1 rounded-lg p-2 text-sm mb-2 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`} style={{ minHeight: '220px' }}>
                    <textarea
                      value={entriesText}
                      onChange={(e) => setEntriesText(e.target.value)}
                      className={`w-full h-full ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} text-sm resize-none outline-none border-none p-0 m-0`}
                      style={{ minHeight: '200px', maxHeight: '340px' }}
                      spellCheck={false}
                    />
                  </div>
                  {/* Version and Changelog */}
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Version 360 <span className="bg-blue-700 text-white rounded px-1 ml-1">New!</span></span>
                    <a href="#" className={darkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}>Changelog</a>
                  </div>
                </>
              ) : (
                <>
                  {/* Results Controls */}
                  <div className="flex gap-2 mb-2">
                    <button onClick={sortResults} className={`flex items-center gap-1 text-white px-3 py-1.5 rounded text-xs font-semibold transition ${darkMode ? 'bg-[#23272b] hover:bg-[#222]' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke={darkMode ? '#fff' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18"/></svg>
                      Sort
                    </button>
                    <button onClick={clearResults} className={`flex items-center gap-1 text-white px-3 py-1.5 rounded text-xs font-semibold transition ${darkMode ? 'bg-[#23272b] hover:bg-[#222]' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      Clear the list
                    </button>
                  </div>
                  {/* Results textarea-like box */}
                  <div className={`flex-1 rounded-lg p-2 text-sm mb-2 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`} style={{ minHeight: '220px' }}>
                    <textarea
                      value={results.join('\n')}
                      readOnly
                      className={`w-full h-full ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} text-sm resize-none outline-none border-none p-0 m-0`}
                      style={{ minHeight: '200px', maxHeight: '340px' }}
                      spellCheck={false}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </aside>
      </main>
      {/* Spin message overlay above the wheel */}
    {showSpinMessage && (
  <div
    className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex flex-col items-center w-full"
    style={{
      transform: 'translate(-50%, -50%)',
      userSelect: 'none',
    }}
  >
    <div
      style={{
        fontFamily: 'Quicksand, Arial, sans-serif',
        fontWeight: 700,
        fontSize: '2.5rem',
        color: darkMode ? '#fff' : '#000', // White in dark mode, black in light mode
        textShadow: '2px 2px 10px rgba(0, 0, 0, 0.7), -2px -2px 10px rgba(255, 255, 255, 0.7)', // Stronger shadow for contrast
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        letterSpacing: '1px',
      }}
    >
      Click to spin
    </div>
    <div
      style={{
        fontFamily: 'Quicksand, Arial, sans-serif',
        fontWeight: 700,
        fontSize: '1.5rem',
        color: darkMode ? '#fff' : '#000', // White in dark mode, black in light mode
        textShadow: '2px 2px 10px rgba(0, 0, 0, 0.7), -2px -2px 10px rgba(255, 255, 255, 0.7)', // Stronger shadow for contrast
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
        padding: '0.25rem 0.75rem',
        borderRadius: '8px',
        letterSpacing: '1px',
      }}
    >
      or press ctrl+enter
    </div>
  </div>
)}
      {/* Winner Modal */}
      {showWinnerModal && winner && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ backdropFilter: 'blur(5px)' }}>
    <div className={`bg-${darkMode ? '#222' : '#f9f9f9'} rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 relative border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className={`bg-${darkMode ? 'red-600' : 'red-500'} text-white text-lg font-bold rounded-t-xl px-6 py-3 flex items-center justify-between`}>
        <span style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}>We have a winner!</span>
        <button className="text-2xl font-bold hover:text-gray-200" onClick={closeWinnerModal} style={{ lineHeight: 1 }}>×</button>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-4 bg-${darkMode ? '#333' : '#e5e7eb'} rounded-b-xl">
        <div className="text-4xl font-light mb-4 text-center" style={{ fontFamily: 'Quicksand, Arial, sans-serif', fontWeight: 500, color: darkMode ? '#fff' : '#333', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)' }}>{winner}</div>
        <div className="flex gap-3">
          <button className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-black hover:bg-gray-400'}`} onClick={closeWinnerModal}>Close</button>
          <button className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-400 text-black hover:bg-blue-300'}`} onClick={removeWinner}>Remove</button>
          <button className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-400 text-black hover:bg-blue-300'}`} onClick={removeAllWinner}>Remove all instances</button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// Confetti effect component
function ConfettiEffect() {
  // Simple confetti using absolutely positioned divs
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FBBC05', '#EA4335', '#4285F4', '#34A853'];
  const confettiPieces = Array.from({ length: 80 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {confettiPieces.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = 6 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = 2.5 + Math.random() * 1.5;
        const delay = Math.random() * 1.5;
        const rotate = Math.random() * 360;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size * 0.4}px`,
              backgroundColor: color,
              borderRadius: '2px',
              opacity: 0.85,
              transform: `rotate(${rotate}deg)`,
              animation: `confetti-fall ${duration}s ${delay}s linear forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 0.85; transform: translateY(-10vh) scale(1) rotate(0deg); }
          80% { opacity: 0.85; }
          100% { opacity: 0; transform: translateY(100vh) scale(0.8) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}