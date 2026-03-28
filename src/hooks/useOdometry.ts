import { useState, useEffect, useCallback, useRef } from "react";

export interface OdometryPoint {
  x: number;
  y: number;
  heading: number;
  timestamp: number;
}

export interface OdometryData {
  x: number;
  y: number;
  heading: number;
  vLinear: number;
  vAngular: number;
  active: boolean;
}

interface UseOdometryOptions {
  maxTrailPoints?: number;
  minMovementThreshold?: number; // meters
  sampleInterval?: number; // ms
}

const DEMO_MODE = true; // Set false when real backend is available

export function useOdometry(options: UseOdometryOptions = {}) {
  const {
    maxTrailPoints = 500,
    minMovementThreshold = 0.005, // 5mm
    sampleInterval = 100,
  } = options;

  const [odometry, setOdometry] = useState<OdometryData>({
    x: 0,
    y: 0,
    heading: 0,
    vLinear: 0,
    vAngular: 0,
    active: DEMO_MODE,
  });

  const [trail, setTrail] = useState<OdometryPoint[]>([
    { x: 0, y: 0, heading: 0, timestamp: Date.now() },
  ]);

  const lastRecordedPoint = useRef<OdometryPoint>({
    x: 0,
    y: 0,
    heading: 0,
    timestamp: Date.now(),
  });

  const addTrailPoint = useCallback(
    (x: number, y: number, heading: number) => {
      const last = lastRecordedPoint.current;
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minMovementThreshold) return;

      const point: OdometryPoint = { x, y, heading, timestamp: Date.now() };
      lastRecordedPoint.current = point;

      setTrail((prev) => {
        const next = [...prev, point];
        return next.length > maxTrailPoints
          ? next.slice(next.length - maxTrailPoints)
          : next;
      });
    },
    [maxTrailPoints, minMovementThreshold]
  );

  const resetTrail = useCallback(() => {
    const origin: OdometryPoint = {
      x: 0,
      y: 0,
      heading: 0,
      timestamp: Date.now(),
    };
    setTrail([origin]);
    lastRecordedPoint.current = origin;
    setOdometry((prev) => ({ ...prev, x: 0, y: 0, heading: 0 }));
  }, []);

  // Demo simulation — replace with WebSocket / polling in production
  useEffect(() => {
    if (!DEMO_MODE) return;

    let t = 0;
    const interval = setInterval(() => {
      t += sampleInterval / 1000;

      // Figure-8 pattern for demo
      const scale = 0.8;
      const x = scale * Math.sin(t * 0.5);
      const y = scale * Math.sin(t * 0.25) * Math.cos(t * 0.5);
      const heading = ((Math.atan2(
        Math.cos(t * 0.25) * Math.cos(t * 0.5) * 0.25 - Math.sin(t * 0.25) * Math.sin(t * 0.5) * 0.5,
        Math.cos(t * 0.5) * 0.5
      ) * 180) / Math.PI);

      const vLinear = 0.15 + Math.abs(Math.sin(t * 0.3)) * 0.3;
      const vAngular = Math.sin(t * 0.7) * 30;

      setOdometry({
        x,
        y,
        heading,
        vLinear,
        vAngular,
        active: true,
      });

      addTrailPoint(x, y, heading);
    }, sampleInterval);

    return () => clearInterval(interval);
  }, [sampleInterval, addTrailPoint]);

  // Production: WebSocket connection (uncomment when backend ready)
  // useEffect(() => {
  //   if (DEMO_MODE) return;
  //   const ws = new WebSocket(`ws://${serverIp}/ws/odometry`);
  //   ws.onmessage = (e) => {
  //     const data = JSON.parse(e.data);
  //     setOdometry({
  //       x: data.odometry_x_m,
  //       y: data.odometry_y_m,
  //       heading: data.odometry_heading_deg,
  //       vLinear: data.odometry_v_linear,
  //       vAngular: data.odometry_v_angular,
  //       active: data.odometry_active,
  //     });
  //     if (data.odometry_active) {
  //       addTrailPoint(data.odometry_x_m, data.odometry_y_m, data.odometry_heading_deg);
  //     }
  //   };
  //   return () => ws.close();
  // }, [addTrailPoint]);

  const distanceFromStart = Math.sqrt(
    odometry.x * odometry.x + odometry.y * odometry.y
  );

  return {
    odometry,
    trail,
    distanceFromStart,
    resetTrail,
  };
}
