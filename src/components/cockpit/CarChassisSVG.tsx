interface CarChassisSVGProps {
  frontWheelAngle: number;
  throttle: boolean;
  brake: boolean;
  gear: string;
  speed: number;
}

export const CarChassisSVG = ({
  frontWheelAngle,
  throttle,
  brake,
  gear,
  speed,
}: CarChassisSVGProps) => {
  const treadSpeed = Math.max(0.08, 0.6 - speed / 200);

  return (
    <svg viewBox="0 0 140 200" className="w-full h-auto drop-shadow-2xl">
      <defs>
        {/* Chassis metal gradient - dark anodized aluminum */}
        <linearGradient id="chassisMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="25%" stopColor="#1a1a1a" />
          <stop offset="50%" stopColor="#252525" />
          <stop offset="75%" stopColor="#141414" />
          <stop offset="100%" stopColor="#1e1e1e" />
        </linearGradient>

        {/* Chassis top plate - slightly lighter with reflection */}
        <linearGradient id="chassisTop" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#383838" />
          <stop offset="20%" stopColor="#2c2c2c" />
          <stop offset="40%" stopColor="#333" />
          <stop offset="60%" stopColor="#222" />
          <stop offset="80%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        {/* Chrome / brushed metal for motors */}
        <linearGradient id="chromeMotor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="15%" stopColor="#aaa" />
          <stop offset="30%" stopColor="#d0d0d0" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="70%" stopColor="#bbb" />
          <stop offset="85%" stopColor="#999" />
          <stop offset="100%" stopColor="#777" />
        </linearGradient>

        <linearGradient id="chromeMotorH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ccc" />
          <stop offset="20%" stopColor="#999" />
          <stop offset="40%" stopColor="#ddd" />
          <stop offset="60%" stopColor="#aaa" />
          <stop offset="80%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#888" />
        </linearGradient>

        {/* Brass standoff gradient */}
        <radialGradient id="brassGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#d4a844" />
          <stop offset="40%" stopColor="#b8922e" />
          <stop offset="80%" stopColor="#8a6d1f" />
          <stop offset="100%" stopColor="#6b5518" />
        </radialGradient>

        {/* Tire rubber gradient */}
        <radialGradient id="tireRubber" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="60%" stopColor="#222" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>

        {/* Red rim gradient */}
        <radialGradient id="redRim" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#e83030" />
          <stop offset="50%" stopColor="#cc1a1a" />
          <stop offset="100%" stopColor="#8b0000" />
        </radialGradient>

        {/* Wheel hub */}
        <radialGradient id="wheelHub" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ccc" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="100%" stopColor="#555" />
        </radialGradient>

        {/* Servo body */}
        <linearGradient id="servoBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2d2d2d" />
          <stop offset="50%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>

        {/* 3D bevel for chassis edge */}
        <linearGradient id="chassisEdgeTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#444" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>

        <linearGradient id="chassisEdgeBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>

        {/* Ground shadow */}
        <radialGradient id="groundShadow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
          <stop offset="70%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Screw head gradient */}
        <radialGradient id="screwHead" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#ddd" />
          <stop offset="40%" stopColor="#aaa" />
          <stop offset="100%" stopColor="#666" />
        </radialGradient>

        {/* PCB board */}
        <linearGradient id="pcbBoard" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2e1a" />
          <stop offset="50%" stopColor="#143014" />
          <stop offset="100%" stopColor="#0e250e" />
        </linearGradient>

        {/* Tire tread pattern */}
        <pattern id="treadPattern" x="0" y="0" width="6" height="4" patternUnits="userSpaceOnUse">
          <path d="M0,0 L3,2 L6,0 L6,1.5 L3,3.5 L0,1.5Z" fill="#2a2a2a" />
          <path d="M0,2 L3,4 L6,2" fill="none" stroke="#333" strokeWidth="0.3" />
        </pattern>

        {/* Chassis hole pattern */}
        <pattern id="holePattern" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.3" fill="#0a0a0a" stroke="#222" strokeWidth="0.3" />
        </pattern>

        {/* Clip paths for tire treads */}
        <clipPath id="clipFL"><ellipse cx="18" cy="34" rx="14" ry="18" /></clipPath>
        <clipPath id="clipFR"><ellipse cx="122" cy="34" rx="14" ry="18" /></clipPath>
        <clipPath id="clipRL"><ellipse cx="18" cy="160" rx="14" ry="18" /></clipPath>
        <clipPath id="clipRR"><ellipse cx="122" cy="160" rx="14" ry="18" /></clipPath>

        {/* Filters */}
        <filter id="innerShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feOffset dx="1" dy="1" result="offsetBlur" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
          <feFlood floodColor="#000" floodOpacity="0.5" />
          <feComposite in2="shadowDiff" operator="in" />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>

        <filter id="metalShine" x="-5%" y="-5%" width="110%" height="110%">
          <feSpecularLighting surfaceScale="3" specularConstant="0.8" specularExponent="25" result="specOut">
            <fePointLight x="50" y="30" z="80" />
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
        </filter>

        <filter id="dropShadow3d">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* ===== GROUND SHADOW ===== */}
      <ellipse cx="70" cy="100" rx="55" ry="80" fill="url(#groundShadow)" />

      {/* ===== LOWER CHASSIS PLATE (gives 3D depth) ===== */}
      <rect x="28" y="22" width="84" height="156" rx="3" fill="#111" stroke="#222" strokeWidth="0.5" />

      {/* ===== BRASS STANDOFFS (connecting upper & lower plates) ===== */}
      {[[36, 30], [104, 30], [36, 95], [104, 95], [36, 168], [104, 168]].map(([cx, cy], i) => (
        <g key={`standoff-${i}`}>
          {/* Shadow */}
          <ellipse cx={cx + 0.5} cy={cy + 0.5} rx="3.5" ry="3.5" fill="rgba(0,0,0,0.3)" />
          {/* Brass cylinder body */}
          <circle cx={cx} cy={cy} r="3.2" fill="url(#brassGrad)" />
          {/* Highlight ring */}
          <circle cx={cx} cy={cy} r="2.8" fill="none" stroke="#d4a844" strokeWidth="0.3" opacity="0.5" />
          {/* Center screw hole */}
          <circle cx={cx} cy={cy} r="1.2" fill="#444" stroke="#333" strokeWidth="0.3" />
          {/* Screw cross */}
          <line x1={cx - 0.8} y1={cy} x2={cx + 0.8} y2={cy} stroke="#555" strokeWidth="0.3" />
          <line x1={cx} y1={cy - 0.8} x2={cx} y2={cy + 0.8} stroke="#555" strokeWidth="0.3" />
        </g>
      ))}

      {/* ===== ENCODER MOTORS (chrome cylinders, rear) ===== */}
      <g>
        {/* Left motor */}
        <rect x="24" y="138" width="16" height="34" rx="3" fill="url(#chromeMotor)" filter="url(#dropShadow3d)" />
        <rect x="25" y="139" width="14" height="32" rx="2.5" fill="url(#chromeMotorH)" opacity="0.4" />
        {/* Motor bands */}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`ml-${i}`} x1="25" y1={142 + i * 6} x2="39" y2={142 + i * 6} stroke="#666" strokeWidth="0.4" opacity="0.6" />
        ))}
        {/* Motor shaft left */}
        <rect x="18" y="152" width="7" height="4" rx="1" fill="#888" stroke="#666" strokeWidth="0.3" />

        {/* Right motor */}
        <rect x="100" y="138" width="16" height="34" rx="3" fill="url(#chromeMotor)" filter="url(#dropShadow3d)" />
        <rect x="101" y="139" width="14" height="32" rx="2.5" fill="url(#chromeMotorH)" opacity="0.4" />
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`mr-${i}`} x1="101" y1={142 + i * 6} x2="115" y2={142 + i * 6} stroke="#666" strokeWidth="0.4" opacity="0.6" />
        ))}
        <rect x="115" y="152" width="7" height="4" rx="1" fill="#888" stroke="#666" strokeWidth="0.3" />
      </g>

      {/* ===== SERVO (front, LD-1501MG) ===== */}
      <g>
        <rect x="52" y="25" width="18" height="14" rx="1.5" fill="url(#servoBody)" filter="url(#dropShadow3d)" stroke="#333" strokeWidth="0.5" />
        {/* Servo horn */}
        <rect x="58" y="22" width="6" height="4" rx="1" fill="#444" stroke="#555" strokeWidth="0.3" />
        {/* Servo label */}
        <text x="61" y="34" textAnchor="middle" fill="#666" fontSize="3" fontFamily="monospace">SERVO</text>
        {/* Servo mounting ears */}
        <rect x="48" y="29" width="5" height="6" rx="0.5" fill="#222" stroke="#333" strokeWidth="0.3" />
        <circle cx="50" cy="32" r="1" fill="#111" stroke="#333" strokeWidth="0.2" />
        <rect x="69" y="29" width="5" height="6" rx="0.5" fill="#222" stroke="#333" strokeWidth="0.3" />
        <circle cx="72" cy="32" r="1" fill="#111" stroke="#333" strokeWidth="0.2" />
      </g>

      {/* ===== UPPER CHASSIS PLATE ===== */}
      <g filter="url(#metalShine)">
        {/* Main plate */}
        <rect x="30" y="18" width="80" height="160" rx="4" fill="url(#chassisTop)" stroke="#333" strokeWidth="0.8" />
        
        {/* 3D edge - top highlight */}
        <line x1="31" y1="19" x2="109" y2="19" stroke="#555" strokeWidth="0.5" opacity="0.6" />
        <line x1="30" y1="19" x2="30" y2="177" stroke="#444" strokeWidth="0.4" opacity="0.4" />
        
        {/* Expansion hole grid */}
        <rect x="34" y="22" width="72" height="152" rx="2" fill="url(#holePattern)" opacity="0.6" />

        {/* Cutout windows - matching the real chassis */}
        <rect x="36" y="45" width="14" height="20" rx="2" fill="#0a0a0a" stroke="#222" strokeWidth="0.5" />
        <rect x="90" y="45" width="14" height="20" rx="2" fill="#0a0a0a" stroke="#222" strokeWidth="0.5" />
        <rect x="36" y="120" width="14" height="20" rx="2" fill="#0a0a0a" stroke="#222" strokeWidth="0.5" />
        <rect x="90" y="120" width="14" height="20" rx="2" fill="#0a0a0a" stroke="#222" strokeWidth="0.5" />

        {/* Large center cutout */}
        <rect x="50" y="70" width="20" height="14" rx="2.5" fill="#0a0a0a" stroke="#222" strokeWidth="0.5" />
        
        {/* Ventilation slots - right side */}
        {[0, 1, 2].map(i => (
          <rect key={`vs-r-${i}`} x="92" y={85 + i * 12} width="14" height="3.5" rx="1" fill="#0a0a0a" stroke="#222" strokeWidth="0.4" />
        ))}
        {/* Ventilation slots - left side */}
        {[0, 1, 2].map(i => (
          <rect key={`vs-l-${i}`} x="34" y={85 + i * 12} width="14" height="3.5" rx="1" fill="#0a0a0a" stroke="#222" strokeWidth="0.4" />
        ))}

        {/* Corner screws on chassis plate */}
        {[[34, 22], [106, 22], [34, 172], [106, 172], [70, 22], [70, 172]].map(([cx, cy], i) => (
          <g key={`screw-${i}`}>
            <circle cx={cx} cy={cy} r="2" fill="url(#screwHead)" />
            <line x1={cx - 1} y1={cy} x2={cx + 1} y2={cy} stroke="#888" strokeWidth="0.4" />
            <line x1={cx} y1={cy - 1} x2={cx} y2={cy + 1} stroke="#888" strokeWidth="0.4" />
          </g>
        ))}
      </g>

      {/* ===== FRONT AXLE ===== */}
      <line x1="28" y1="34" x2="48" y2="34" stroke="#555" strokeWidth="2" />
      <line x1="74" y1="34" x2="112" y2="34" stroke="#555" strokeWidth="2" />

      {/* ===== REAR AXLE ===== */}
      <line x1="28" y1="160" x2="100" y2="160" stroke="#555" strokeWidth="2" />
      <line x1="116" y1="160" x2="112" y2="160" stroke="#555" strokeWidth="2" />

      {/* ===== WHEELS - Turbine spoke style with red rims ===== */}
      {/* FRONT LEFT */}
      <g transform={`rotate(${frontWheelAngle}, 18, 34)`}>
        {/* Tire body */}
        <ellipse cx="18" cy="34" rx="14" ry="18" fill="url(#tireRubber)" stroke="#1a1a1a" strokeWidth="1" />
        {/* Tread texture */}
        <g clipPath="url(#clipFL)">
          <rect x="4" y="16" width="28" height="36" fill="url(#treadPattern)" opacity="0.5" />
          {speed > 0 && (
            <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
               style={{ animationDuration: `${treadSpeed}s` }}>
              {[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <rect key={i} x="5" y={16 + i * 4} width="26" height="1.5" rx="0.5"
                  fill="rgba(60,60,60,0.5)" />
              ))}
            </g>
          )}
        </g>
        {/* Tire sidewall highlight */}
        <ellipse cx="18" cy="34" rx="13" ry="17" fill="none" stroke="#333" strokeWidth="0.5" />
        {/* Red rim ring */}
        <ellipse cx="18" cy="34" rx="9" ry="12" fill="none" stroke="url(#redRim)" strokeWidth="2.5" />
        <ellipse cx="18" cy="34" rx="9" ry="12" fill="none" stroke="#ff3030" strokeWidth="0.3" opacity="0.5" />
        {/* Spoke area background */}
        <ellipse cx="18" cy="34" rx="7.5" ry="10" fill="#111" />
        {/* Turbine spokes */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const angle = (i * 36 * Math.PI) / 180;
          const x1 = 18 + Math.cos(angle) * 3;
          const y1 = 34 + Math.sin(angle) * 4;
          const nextAngle = ((i * 36 + 20) * Math.PI) / 180;
          const x2 = 18 + Math.cos(nextAngle) * 7.5;
          const y2 = 34 + Math.sin(nextAngle) * 10;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#222" strokeWidth="1.8" strokeLinecap="round" />
          );
        })}
        {/* Center hub */}
        <circle cx="18" cy="34" r="2.5" fill="url(#wheelHub)" />
        <circle cx="18" cy="34" r="1.5" fill="url(#screwHead)" />
        <line x1="17.2" y1="34" x2="18.8" y2="34" stroke="#999" strokeWidth="0.3" />
        <line x1="18" y1="33.2" x2="18" y2="34.8" stroke="#999" strokeWidth="0.3" />
      </g>

      {/* FRONT RIGHT */}
      <g transform={`rotate(${frontWheelAngle}, 122, 34)`}>
        <ellipse cx="122" cy="34" rx="14" ry="18" fill="url(#tireRubber)" stroke="#1a1a1a" strokeWidth="1" />
        <g clipPath="url(#clipFR)">
          <rect x="108" y="16" width="28" height="36" fill="url(#treadPattern)" opacity="0.5" />
          {speed > 0 && (
            <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
               style={{ animationDuration: `${treadSpeed}s` }}>
              {[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <rect key={i} x="109" y={16 + i * 4} width="26" height="1.5" rx="0.5"
                  fill="rgba(60,60,60,0.5)" />
              ))}
            </g>
          )}
        </g>
        <ellipse cx="122" cy="34" rx="13" ry="17" fill="none" stroke="#333" strokeWidth="0.5" />
        <ellipse cx="122" cy="34" rx="9" ry="12" fill="none" stroke="url(#redRim)" strokeWidth="2.5" />
        <ellipse cx="122" cy="34" rx="9" ry="12" fill="none" stroke="#ff3030" strokeWidth="0.3" opacity="0.5" />
        <ellipse cx="122" cy="34" rx="7.5" ry="10" fill="#111" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const angle = (i * 36 * Math.PI) / 180;
          const x1 = 122 + Math.cos(angle) * 3;
          const y1 = 34 + Math.sin(angle) * 4;
          const nextAngle = ((i * 36 + 20) * Math.PI) / 180;
          const x2 = 122 + Math.cos(nextAngle) * 7.5;
          const y2 = 34 + Math.sin(nextAngle) * 10;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" strokeWidth="1.8" strokeLinecap="round" />;
        })}
        <circle cx="122" cy="34" r="2.5" fill="url(#wheelHub)" />
        <circle cx="122" cy="34" r="1.5" fill="url(#screwHead)" />
        <line x1="121.2" y1="34" x2="122.8" y2="34" stroke="#999" strokeWidth="0.3" />
        <line x1="122" y1="33.2" x2="122" y2="34.8" stroke="#999" strokeWidth="0.3" />
      </g>

      {/* REAR LEFT */}
      <g>
        <ellipse cx="18" cy="160" rx="14" ry="18" fill="url(#tireRubber)" stroke="#1a1a1a" strokeWidth="1" />
        <g clipPath="url(#clipRL)">
          <rect x="4" y="142" width="28" height="36" fill="url(#treadPattern)" opacity="0.5" />
          {speed > 0 && (
            <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
               style={{ animationDuration: `${treadSpeed}s` }}>
              {[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <rect key={i} x="5" y={142 + i * 4} width="26" height="1.5" rx="0.5"
                  fill="rgba(60,60,60,0.5)" />
              ))}
            </g>
          )}
        </g>
        <ellipse cx="18" cy="160" rx="13" ry="17" fill="none" stroke="#333" strokeWidth="0.5" />
        <ellipse cx="18" cy="160" rx="9" ry="12" fill="none" stroke="url(#redRim)" strokeWidth="2.5"
          style={{ filter: throttle || brake ? 'drop-shadow(0 0 3px #ff2020)' : 'none' }} />
        <ellipse cx="18" cy="160" rx="7.5" ry="10" fill="#111" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const angle = (i * 36 * Math.PI) / 180;
          const x1 = 18 + Math.cos(angle) * 3;
          const y1 = 160 + Math.sin(angle) * 4;
          const nextAngle = ((i * 36 + 20) * Math.PI) / 180;
          const x2 = 18 + Math.cos(nextAngle) * 7.5;
          const y2 = 160 + Math.sin(nextAngle) * 10;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" strokeWidth="1.8" strokeLinecap="round" />;
        })}
        <circle cx="18" cy="160" r="2.5" fill="url(#wheelHub)" />
        <circle cx="18" cy="160" r="1.5" fill="url(#screwHead)" />
        <line x1="17.2" y1="160" x2="18.8" y2="160" stroke="#999" strokeWidth="0.3" />
        <line x1="18" y1="159.2" x2="18" y2="160.8" stroke="#999" strokeWidth="0.3" />
      </g>

      {/* REAR RIGHT */}
      <g>
        <ellipse cx="122" cy="160" rx="14" ry="18" fill="url(#tireRubber)" stroke="#1a1a1a" strokeWidth="1" />
        <g clipPath="url(#clipRR)">
          <rect x="108" y="142" width="28" height="36" fill="url(#treadPattern)" opacity="0.5" />
          {speed > 0 && (
            <g className={gear === 'R' ? 'animate-tread-reverse' : 'animate-tread'}
               style={{ animationDuration: `${treadSpeed}s` }}>
              {[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <rect key={i} x="109" y={142 + i * 4} width="26" height="1.5" rx="0.5"
                  fill="rgba(60,60,60,0.5)" />
              ))}
            </g>
          )}
        </g>
        <ellipse cx="122" cy="160" rx="13" ry="17" fill="none" stroke="#333" strokeWidth="0.5" />
        <ellipse cx="122" cy="160" rx="9" ry="12" fill="none" stroke="url(#redRim)" strokeWidth="2.5"
          style={{ filter: throttle || brake ? 'drop-shadow(0 0 3px #ff2020)' : 'none' }} />
        <ellipse cx="122" cy="160" rx="7.5" ry="10" fill="#111" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const angle = (i * 36 * Math.PI) / 180;
          const x1 = 122 + Math.cos(angle) * 3;
          const y1 = 160 + Math.sin(angle) * 4;
          const nextAngle = ((i * 36 + 20) * Math.PI) / 180;
          const x2 = 122 + Math.cos(nextAngle) * 7.5;
          const y2 = 160 + Math.sin(nextAngle) * 10;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#222" strokeWidth="1.8" strokeLinecap="round" />;
        })}
        <circle cx="122" cy="160" r="2.5" fill="url(#wheelHub)" />
        <circle cx="122" cy="160" r="1.5" fill="url(#screwHead)" />
        <line x1="121.2" y1="160" x2="122.8" y2="160" stroke="#999" strokeWidth="0.3" />
        <line x1="122" y1="159.2" x2="122" y2="160.8" stroke="#999" strokeWidth="0.3" />
      </g>

      {/* ===== BRAKE LIGHTS ===== */}
      <rect x="50" y="174" width="40" height="3" rx="1"
        fill={brake ? '#ff1a1a' : '#331111'}
        stroke={brake ? '#ff0000' : '#221111'}
        strokeWidth="0.5"
        style={{ filter: brake ? 'drop-shadow(0 0 6px #ff0000) drop-shadow(0 0 12px #ff0000)' : 'none' }}
      />
      {brake && (
        <ellipse cx="70" cy="176" rx="22" ry="6" fill="rgba(255,0,0,0.15)" className="animate-pulse" />
      )}

      {/* ===== REVERSE SONAR ===== */}
      {gear === 'R' && (
        <g>
          <ellipse cx="70" cy="184" rx="16" ry="6" fill="none"
            stroke="hsl(var(--warning))" strokeWidth="1.5" className="animate-sonar-1" style={{ transformOrigin: '70px 184px' }} />
          <ellipse cx="70" cy="184" rx="16" ry="6" fill="none"
            stroke="hsl(var(--warning))" strokeWidth="1.2" className="animate-sonar-2" style={{ transformOrigin: '70px 184px' }} />
          <ellipse cx="70" cy="184" rx="16" ry="6" fill="none"
            stroke="hsl(var(--warning))" strokeWidth="0.8" className="animate-sonar-3" style={{ transformOrigin: '70px 184px' }} />
          <rect x="44" y="192" width="52" height="5" rx="1"
            fill="hsl(var(--destructive) / 0.6)" stroke="hsl(var(--destructive))" strokeWidth="0.8" className="animate-pulse" />
          <text x="70" y="204" textAnchor="middle" fill="hsl(var(--destructive))" fontSize="5" fontWeight="bold" className="animate-pulse">
            OBSTACLE
          </text>
        </g>
      )}
    </svg>
  );
};
