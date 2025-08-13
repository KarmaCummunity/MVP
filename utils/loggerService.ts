// Logger service that saves logs to both console and file
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = 'app_debug_logs';
const MAX_LOGS = 1000; // Keep last 1000 log entries

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  data?: any;
}

class LoggerService {
  private logs: LogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  private async loadLogs() {
    try {
      const stored = await AsyncStorage.getItem(LOGS_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  private async saveLogs() {
    try {
      // Keep only the last MAX_LOGS entries
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }

  private addLog(level: 'info' | 'warn' | 'error', component: string, message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    this.logs.push(logEntry);
    this.saveLogs();

    // Also log to console for immediate debugging
    const prefix = `[${logEntry.timestamp}] ${component}:`;
    const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message;

    switch (level) {
      case 'info':
        console.log(prefix, fullMessage);
        break;
      case 'warn':
        console.warn(prefix, fullMessage);
        break;
      case 'error':
        console.error(prefix, fullMessage);
        break;
    }
  }

  info(component: string, message: string, data?: any) {
    this.addLog('info', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.addLog('warn', component, message, data);
  }

  error(component: string, message: string, data?: any) {
    this.addLog('error', component, message, data);
  }

  async exportLogs(): Promise<string> {
    return this.logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()} ${log.component}: ${log.message}${log.data ? ` ${JSON.stringify(log.data)}` : ''}`)
      .join('\n');
  }

  async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem(LOGS_KEY);
    console.log('🗑️ All logs cleared');
  }

  async downloadLogs() {
    if (Platform.OS === 'web') {
      const logsText = await this.exportLogs();
      const element = document.createElement('a');
      const file = new Blob([logsText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `google-auth-logs-${new Date().toISOString().slice(0, 19)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      console.log('📁 Logs downloaded');
    }
  }

  async showLogs() {
    const logsText = await this.exportLogs();
    console.log('📋 Complete logs:');
    console.log(logsText);
    return logsText;
  }
}

export const logger = new LoggerService();
