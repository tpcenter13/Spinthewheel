'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [spinSpeed, setSpinSpeed] = useState(4); // Speed in seconds (1-10)
  const [wheelSize, setWheelSize] = useState(384);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winner, setWinner] = useState('');
  const wheelRef = useRef<HTMLDivElement>(null);

  // Handle responsive wheel sizing
  useEffect(() => {
    const updateWheelSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) { // sm breakpoint
        setWheelSize(280);
      } else if (screenWidth < 768) { // md breakpoint
        setWheelSize(320);
      } else if (screenWidth < 1024) { // lg breakpoint
        setWheelSize(360);
      } else {
        setWheelSize(384);
      }
    };

    updateWheelSize();
    window.addEventListener('resize', updateWheelSize);
    return () => window.removeEventListener('resize', updateWheelSize);
  }, []);

  const addSegment = () => {
    if (inputValue.trim() && segments.length < 12) {
      setSegments([...segments, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const spin = () => {
    if (isSpinning || segments.length < 2) return;

    setIsSpinning(true);
    setResult('');
    
    // Reset wheel transition and position first
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
      setAngle(0);
    }

    // Small delay to ensure the reset takes effect
    setTimeout(() => {
      const randomDeg = Math.floor(3600 + Math.random() * 360);
      setAngle(randomDeg);

      if (wheelRef.current) {
        wheelRef.current.style.transition = `transform ${spinSpeed}s ease-out`;
        wheelRef.current.style.transform = `rotate(${randomDeg}deg)`;
      }

      setTimeout(() => {
        const normalizedAngle = (360 - (randomDeg % 360)) % 360;
        const segmentAngle = 360 / segments.length;
        const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
        const winningSegment = segments[segmentIndex];
        
        setResult(winningSegment);
        setWinner(winningSegment);
        setIsSpinning(false);
        
        // Show celebration modal
        setShowCelebration(true);
        
        // Auto-close modal and remove winner after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
          // Remove the winning segment
          setSegments(prevSegments => prevSegments.filter((_, i) => i !== segmentIndex));
          setResult('');
        }, 3000);
        
      }, spinSpeed * 1000);
    }, 50);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
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
    return Math.max(8, wheelSize * 0.031);
  };

  const getTextLimit = () => {
    if (wheelSize < 300) return 6;
    if (wheelSize < 350) return 8;
    return 10;
  };

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

  // Celebration Modal
  const CelebrationModal = () => {
    if (!showCelebration) return null;

    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-40 px-4">
        <div className={`relative rounded-2xl p-8 max-w-md w-full text-center ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
        } shadow-2xl animate-bounce`}>
          <Fireworks />
          
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
          <div className={`text-3xl font-bold mb-6 p-4 rounded-lg ${
            darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {winner}
          </div>
          <p className="text-lg mb-4">🎊 Winner! 🎊</p>
          <div className="text-sm opacity-75">
            This option will be removed in a moment...
          </div>
          
          <div className="absolute -top-2 -right-2 text-4xl animate-spin">⭐</div>
          <div className="absolute -top-3 -left-2 text-3xl animate-bounce">🎈</div>
          <div className="absolute -bottom-2 -right-3 text-3xl animate-pulse">🎁</div>
        </div>
      </div>
    );
  };

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 px-2 py-4 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <button
        onClick={toggleDarkMode}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-xs sm:text-sm border rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition"
      >
        <span className="hidden sm:inline">Toggle Dark Mode</span>
        <span className="sm:hidden">🌓</span>
      </button>

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8 w-full max-w-6xl">
        {/* Wheel Section */}
        <div className="flex flex-col items-center w-full lg:w-auto">
          <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
              <div 
                className="w-0 h-0 border-l-transparent border-r-transparent border-b-red-500"
                style={{
                  borderLeftWidth: wheelSize * 0.01,
                  borderRightWidth: wheelSize * 0.01,
                  borderBottomWidth: wheelSize * 0.02
                }}
              ></div>
            </div>
            
            {/* Spinning Wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full absolute"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <svg
                width={wheelSize}
                height={wheelSize}
                viewBox={`0 0 ${wheelSize} ${wheelSize}`}
                className="w-full h-full"
              >
                {segments.map((segment, index) => {
                  const textPos = getTextPosition(index, segments.length);
                  const textLimit = getTextLimit();
                  return (
                    <g key={index}>
                      <path
                        d={createSlicePath(index, segments.length)}
                        fill={index % 2 === 0
                          ? (darkMode ? '#374151' : '#e5e7eb')
                          : (darkMode ? '#4b5563' : '#f3f4f6')
                        }
                        stroke={darkMode ? '#1f2937' : '#9ca3af'}
                        strokeWidth="1"
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={getWheelFontSize()}
                        fontWeight="600"
                        fill={darkMode ? '#ffffff' : '#000000'}
                        transform={`rotate(${textPos.rotation > 90 && textPos.rotation < 270 ? textPos.rotation + 180 : textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                      >
                        <tspan x={textPos.x} dy="0">
                          {segment.length > textLimit ? segment.substring(0, textLimit) + '...' : segment}
                        </tspan>
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Spin Button */}
            <button
              onClick={spin}
              disabled={isSpinning || segments.length < 2}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 rounded-full transition-all duration-200 flex items-center justify-center font-bold text-white shadow-lg ${
                isSpinning || segments.length < 2
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 hover:scale-110 active:scale-95'
              }`}
              style={{
                width: wheelSize * 0.104,
                height: wheelSize * 0.104,
                fontSize: wheelSize * 0.025
              }}
              title={segments.length < 2 ? 'Add at least 2 options to spin' : 'Click to spin the wheel'}
            >
              {isSpinning ? (
                <div className="animate-spin">⟳</div>
              ) : (
                'SPIN'
              )}
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full max-w-sm lg:max-w-xs">
          <h3 className="text-lg font-semibold mb-4 text-center lg:text-left">Wheel Options</h3>
          
          {/* Input Section */}
          <div className="space-y-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter new option"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSegment();
                }
              }}
              className={`w-full p-3 text-sm border rounded-lg ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-black placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={addSegment}
              disabled={!inputValue.trim() || segments.length >= 12}
              className={`w-full px-4 py-3 text-sm rounded-lg transition font-medium ${
                !inputValue.trim() || segments.length >= 12
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              Add Option ({segments.length}/12)
            </button>
          </div>

          {/* Speed Control */}
          <div className={`p-3 sm:p-4 border rounded-lg mb-4 ${
            darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <label className="block text-sm font-medium mb-2">
              Spin Speed: {getSpeedLabel(spinSpeed)} ({spinSpeed}s)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={spinSpeed}
              onChange={(e) => setSpinSpeed(parseFloat(e.target.value))}
              disabled={isSpinning}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                darkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-200'
              } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>

          {/* Segments List */}
          <div className={`border rounded-lg p-2 mb-4 ${
            darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}>
            <h4 className="text-sm font-medium mb-2 px-2">Current Options:</h4>
            <div className="space-y-1 max-h-32 sm:max-h-48 overflow-y-auto">
              {segments.length === 0 ? (
                <p className="text-xs text-gray-500 px-2 py-1">No options added yet</p>
              ) : (
                segments.map((segment, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded border text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className="truncate flex-1 mr-2">{segment}</span>
                    <button
                      onClick={() => removeSegment(index)}
                      className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white transition flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Result Display */}
          <div className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center ${
            darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50'
          }`}>
            <h4 className="text-sm font-semibold mb-3">Last Result</h4>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium p-2 text-center ${
              result
                ? (darkMode ? 'border-green-400 bg-green-900 text-green-100' : 'border-green-500 bg-green-100 text-green-800')
                : (darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white')
            }`}>
              <span className="break-words">
                {result || '?'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal />

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 2px rgba(0,0,0,0.6);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 2px rgba(0,0,0,0.6);
        }

        input[type="range"]:focus {
          outline: none;
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .firework-particle {
          transition: all 1s ease-out;
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </main>
  );
}