export interface DebugSample {
  timestamp: string;
  gear: string;
  obstacle_state: string;
  gas_pressed: number;
  brake_pressed: number;
  is_braking: number;
  course_correction_active: number;
  autonomous_mode: number;
  hunter_mode: number;
  emergency_brake_active: number;
  current_pwm: number;
  steer_angle: number;
  user_steer_angle: number;
  rpm_rear_right: number;
  rpm_rear_left: number;
  rpm_front_right: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  mag_x: number;
  mag_y: number;
  mag_z: number;
  temp_c: number;
  compass_heading: number;
  compass_target_heading: number;
  heading_error_deg: number;
  pid_correction: number;
  steer_heading_delta_deg: number;
  battery_voltage: number;
  current_amps: number;
  power_limiter_max_duty: number;
  power_limiter_l298n_drop: number;
  laser_distance_cm: number;
  duty_fl: number;
  duty_fr: number;
  duty_rl: number;
  duty_rr: number;
}

function round(v: number, d: number) {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

export function buildMockDebugData(sampleHz = 1): DebugSample[] {
  const startTime = new Date("2026-03-18T14:32:00");
  const totalSamples = 30 * sampleHz;
  const samples: DebugSample[] = [];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleHz;
    let obstacle_state: string;
    let current_pwm: number;
    let laser_distance_cm: number;
    let steer_angle: number;

    if (t < 10) {
      obstacle_state = "IDLE";
      current_pwm = 42.0 + 4.0 * Math.sin(t / 2.5);
      laser_distance_cm = 80.0 - 2.5 * t;
      steer_angle = 4.0 * Math.sin(t / 3.0);
    } else if (t < 18) {
      obstacle_state = "SLOW";
      current_pwm = 30.0 - 1.4 * (t - 10.0);
      laser_distance_cm = 55.0 - 3.2 * (t - 10.0);
      steer_angle = 6.0 * Math.sin(t / 2.0);
    } else if (t < 22) {
      obstacle_state = "CRAWL";
      current_pwm = 12.0 - 1.2 * (t - 18.0);
      laser_distance_cm = 29.0 - 2.5 * (t - 18.0);
      steer_angle = 3.0 * Math.sin(t);
    } else if (t < 25) {
      obstacle_state = "STOP";
      current_pwm = 0.0;
      laser_distance_cm = 16.0 + 0.5 * (t - 22.0);
      steer_angle = 0.0;
    } else if (t < 28) {
      obstacle_state = "AVOID";
      current_pwm = 16.0 + 2.0 * (t - 25.0);
      laser_distance_cm = 20.0 + 8.0 * (t - 25.0);
      if (t < 26) steer_angle = 24.0;
      else if (t < 27) steer_angle = -22.0;
      else steer_angle = 10.0;
    } else {
      obstacle_state = "IDLE";
      current_pwm = 28.0 + 5.0 * (t - 28.0);
      laser_distance_cm = 50.0 + 6.0 * (t - 28.0);
      steer_angle = 2.0 * Math.sin(t);
    }

    const gas_pressed = current_pwm > 0.5 ? 1 : 0;
    const brake_pressed = obstacle_state === "STOP" ? 1 : 0;
    const is_braking = brake_pressed;
    const user_steer_angle = steer_angle * 0.85;

    let compass_target_heading: number;
    let compass_heading: number;
    if (t < 25) {
      compass_target_heading = 92.0;
      compass_heading = 90.5 + 1.8 * Math.sin(t / 4.0);
    } else if (t < 28) {
      compass_target_heading = 108.0;
      compass_heading = 94.0 + 6.0 * (t - 25.0);
    } else {
      compass_target_heading = 108.0;
      compass_heading = 107.5 + 0.8 * Math.sin(t);
    }

    const heading_error_deg = compass_target_heading - compass_heading;
    const pid_correction = current_pwm === 0 ? 0.0 : heading_error_deg * 0.12;
    const steer_heading_delta_deg = steer_angle * 0.35;
    const course_correction_active = current_pwm > 0.5 && Math.abs(heading_error_deg) > 0.8 ? 1 : 0;

    let rpm_rear_right: number, rpm_rear_left: number, rpm_front_right: number;
    if (current_pwm <= 0.5) {
      rpm_rear_right = 0;
      rpm_rear_left = 0;
      rpm_front_right = 0;
    } else {
      const base_rpm = current_pwm * 2.7;
      rpm_rear_right = base_rpm + 2.0 * Math.sin(t / 2.0);
      rpm_rear_left = base_rpm - 1.5 * Math.sin(t / 2.2);
      rpm_front_right = base_rpm + 1.2 * Math.cos(t / 3.0);
    }

    const accel_x = 0.02 * Math.sin(t / 3.0);
    const accel_y = steer_angle / 300.0;
    const accel_z = 0.998 + 0.01 * Math.cos(t / 5.0);
    const gyro_x = 0.10 * Math.sin(t / 4.0);
    const gyro_y = 0.08 * Math.cos(t / 5.0);
    const gyro_z = steer_angle * 0.18;
    const heading_rad = (compass_heading * Math.PI) / 180;
    const mag_x = 0.32 * Math.cos(heading_rad);
    const mag_y = 0.32 * Math.sin(heading_rad);
    const mag_z = 0.44 + 0.01 * Math.sin(t / 3.5);
    const temp_c = 36.5 + 0.03 * t;

    let current_amps: number;
    if (current_pwm <= 0.5) {
      current_amps = 0.22 + 0.02 * Math.max(0, t - 22.0);
    } else {
      current_amps = 0.55 + current_pwm * 0.032 + (obstacle_state === "AVOID" ? 0.15 : 0.0);
    }

    const battery_voltage = 7.42 - 0.004 * t - current_amps * 0.012;
    const power_limiter_max_duty = Math.max(35.0, 82.0 - current_amps * 4.5);
    const power_limiter_l298n_drop = 1.75 + current_amps * 0.06;
    const steer_bias = steer_angle / 30.0;
    const duty_fl = Math.max(0, current_pwm - steer_bias * 5.0);
    const duty_fr = Math.max(0, current_pwm + steer_bias * 5.0);
    const duty_rl = Math.max(0, current_pwm - steer_bias * 3.5);
    const duty_rr = Math.max(0, current_pwm + steer_bias * 3.5);

    samples.push({
      timestamp: new Date(startTime.getTime() + t * 1000).toISOString(),
      gear: "1",
      obstacle_state,
      gas_pressed,
      brake_pressed,
      is_braking,
      course_correction_active,
      autonomous_mode: 1,
      hunter_mode: 0,
      emergency_brake_active: 0,
      current_pwm: round(current_pwm, 2),
      steer_angle: round(steer_angle, 2),
      user_steer_angle: round(user_steer_angle, 2),
      rpm_rear_right: round(rpm_rear_right, 2),
      rpm_rear_left: round(rpm_rear_left, 2),
      rpm_front_right: round(rpm_front_right, 2),
      accel_x: round(accel_x, 4),
      accel_y: round(accel_y, 4),
      accel_z: round(accel_z, 4),
      gyro_x: round(gyro_x, 3),
      gyro_y: round(gyro_y, 3),
      gyro_z: round(gyro_z, 3),
      mag_x: round(mag_x, 4),
      mag_y: round(mag_y, 4),
      mag_z: round(mag_z, 4),
      temp_c: round(temp_c, 2),
      compass_heading: round(compass_heading, 2),
      compass_target_heading: round(compass_target_heading, 2),
      heading_error_deg: round(heading_error_deg, 2),
      pid_correction: round(pid_correction, 3),
      steer_heading_delta_deg: round(steer_heading_delta_deg, 2),
      battery_voltage: round(battery_voltage, 3),
      current_amps: round(current_amps, 3),
      power_limiter_max_duty: round(power_limiter_max_duty, 2),
      power_limiter_l298n_drop: round(power_limiter_l298n_drop, 2),
      laser_distance_cm: round(laser_distance_cm, 1),
      duty_fl: round(duty_fl, 2),
      duty_fr: round(duty_fr, 2),
      duty_rl: round(duty_rl, 2),
      duty_rr: round(duty_rr, 2),
    });
  }

  return samples;
}

export const FIELD_GROUPS: Record<string, (keyof DebugSample)[]> = {
  "Control": ["gear", "obstacle_state", "gas_pressed", "brake_pressed", "is_braking", "current_pwm", "steer_angle", "user_steer_angle"],
  "Mode": ["autonomous_mode", "hunter_mode", "emergency_brake_active", "course_correction_active"],
  "RPM": ["rpm_rear_right", "rpm_rear_left", "rpm_front_right"],
  "IMU (Accel)": ["accel_x", "accel_y", "accel_z"],
  "IMU (Gyro)": ["gyro_x", "gyro_y", "gyro_z"],
  "IMU (Mag)": ["mag_x", "mag_y", "mag_z"],
  "Navigation": ["compass_heading", "compass_target_heading", "heading_error_deg", "pid_correction", "steer_heading_delta_deg"],
  "Power": ["battery_voltage", "current_amps", "power_limiter_max_duty", "power_limiter_l298n_drop", "temp_c"],
  "Motor Duty": ["duty_fl", "duty_fr", "duty_rl", "duty_rr"],
  "Sensor": ["laser_distance_cm"],
};
