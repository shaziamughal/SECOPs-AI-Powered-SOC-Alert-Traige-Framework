import { Alert, TrendData } from './types';

export const MOCK_ALERTS: Alert[] = [
  {
    id: '#8821',
    severity: 'High',
    rule: 'SSH Brute Force Attempt',
    sourceIp: '192.168.45.12',
    mlClass: 'TP',
    mlConfidence: 99,
    action: 'None',
    timestamp: '2 mins ago'
  },
  {
    id: '#8820',
    severity: 'Medium',
    rule: 'Multiple failed logins',
    sourceIp: '10.0.0.55',
    mlClass: 'TP',
    mlConfidence: 85,
    action: 'None',
    timestamp: '5 mins ago'
  },
  {
    id: '#8819',
    severity: 'Low',
    rule: 'System Update Started',
    sourceIp: 'Localhost',
    mlClass: 'FP',
    mlConfidence: 92,
    action: 'Auto-Closed',
    timestamp: '12 mins ago'
  },
  {
    id: '#8818',
    severity: 'High',
    rule: 'PowerShell Encoded Command',
    sourceIp: '192.168.45.200',
    mlClass: 'TP',
    mlConfidence: 95,
    action: 'None',
    timestamp: '15 mins ago'
  },
  {
    id: '#8817',
    severity: 'Info',
    rule: 'New User Created',
    sourceIp: '10.0.0.4',
    mlClass: 'Uncertain',
    mlConfidence: 0,
    action: 'None',
    timestamp: '22 mins ago'
  },
];

export const TREND_DATA: TrendData[] = [
  { time: '00:00', totalEvents: 120, highSeverity: 20 },
  { time: '02:00', totalEvents: 132, highSeverity: 25 },
  { time: '04:00', totalEvents: 150, highSeverity: 40 },
  { time: '06:00', totalEvents: 280, highSeverity: 35 },
  { time: '08:00', totalEvents: 450, highSeverity: 50 },
  { time: '10:00', totalEvents: 400, highSeverity: 45 },
  { time: '12:00', totalEvents: 320, highSeverity: 30 },
  { time: '14:00', totalEvents: 500, highSeverity: 60 },
  { time: '16:00', totalEvents: 750, highSeverity: 85 },
  { time: '18:00', totalEvents: 680, highSeverity: 70 },
  { time: '20:00', totalEvents: 600, highSeverity: 65 },
];