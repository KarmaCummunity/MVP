// Enhanced Logger service that saves logs to both console and file with performance optimization
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = 'app_debug_logs';
const MAX_LOGS = 1000; // Keep last 1000 log entries
const BATCH_SIZE = 50; // Save logs in batches to improve performance
const SAVE_INTERVAL = 5000; // Save logs every 5 seconds

// Environment detection - safe check for __DEV__
let isDevelopment = false;
try {
  isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
} catch (e) {
  // If __DEV__ is not defined, assume production
  isDevelopment = false;
}
const isProduction = !isDevelopment;

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: Record<string, unknown>;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

class LoggerService {
  private logs: LogEntry[] = [];
  private pendingLogs: LogEntry[] = [];
  private saveTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  
  // Production-friendly: Higher log level in production
  private logLevel: LogLevel = isProduction ? 'warn' : 'debug';
  private enableConsoleOutput = !isProduction;
  private enableStorage = true;

  constructor() {
    // Lazy initialization - don't load logs immediately
    this.initializeAsync();
  }

  private async initializeAsync() {
    if (!this.isInitialized) {
      await this.loadLogs();
      this.startBatchTimer();
      this.isInitialized = true;
    }
  }

  private async loadLogs() {
    if (!this.enableStorage) return;
    
    try {
      const stored = await AsyncStorage.getItem(LOGS_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      if (this.enableConsoleOutput) {
        console.error('Failed to load logs:', error);
      }
    }
  }

  private async saveLogs() {
    if (!this.enableStorage || this.pendingLogs.length === 0) return;
    
    try {
      // Add pending logs to main logs array
      this.logs = [...this.logs, ...this.pendingLogs];
      this.pendingLogs = [];
      
      // Keep only the last MAX_LOGS entries
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(this.logs));
    } catch (error) {
      if (this.enableConsoleOutput) {
        console.error('Failed to save logs:', error);
      }
    }
  }

  private startBatchTimer() {
    if (this.saveTimer) clearInterval(this.saveTimer);
    
    this.saveTimer = setInterval(() => {
      this.saveLogs();
    }, SAVE_INTERVAL);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
    return levels[level] >= levels[this.logLevel];
  }

  private addLog(level: 'info' | 'warn' | 'error' | 'debug', component: string, message: string, data?: Record<string, unknown>) {
    // Early return if log level is not enabled
    if (!this.shouldLog(level)) return;
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    // Add to pending logs for batching
    this.pendingLogs.push(logEntry);
    
    // Force save if batch is full
    if (this.pendingLogs.length >= BATCH_SIZE) {
      this.saveLogs();
    }

    // Console output only if enabled (disabled in production by default)
    if (this.enableConsoleOutput) {
      const prefix = `[${logEntry.timestamp}] ${component}:`;
      const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message;

      switch (level) {
        case 'debug':
          console.log(`🔍 ${prefix}`, fullMessage);
          break;
        case 'info':
          console.log(`ℹ️  ${prefix}`, fullMessage);
          break;
        case 'warn':
          console.warn(`⚠️  ${prefix}`, fullMessage);
          break;
        case 'error':
          console.error(`❌ ${prefix}`, fullMessage);
          break;
      }
    }
  }

  debug(component: string, message: string, data?: Record<string, unknown>) {
    this.addLog('debug', component, message, data);
  }

  info(component: string, message: string, data?: Record<string, unknown>) {
    this.addLog('info', component, message, data);
  }

  warn(component: string, message: string, data?: Record<string, unknown>) {
    this.addLog('warn', component, message, data);
  }

  error(component: string, message: string, data?: Record<string, unknown>) {
    this.addLog('error', component, message, data);
  }

  // Configuration methods
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  setConsoleOutput(enabled: boolean) {
    this.enableConsoleOutput = enabled;
  }

  setStorageEnabled(enabled: boolean) {
    this.enableStorage = enabled;
  }

  async exportLogs(): Promise<string> {
    return this.logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()} ${log.component}: ${log.message}${log.data ? ` ${JSON.stringify(log.data)}` : ''}`)
      .join('\n');
  }

  async clearLogs() {
    this.logs = [];
    this.pendingLogs = [];
    if (this.enableStorage) {
      await AsyncStorage.removeItem(LOGS_KEY);
    }
    if (this.enableConsoleOutput) {
      console.log('🗑️ All logs cleared');
    }
  }

  async downloadLogs() {
    if (Platform.OS === 'web') {
      // Force save pending logs before export
      await this.saveLogs();
      
      const logsText = await this.exportLogs();
      const element = document.createElement('a');
      const file = new Blob([logsText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `karma-community-logs-${new Date().toISOString().slice(0, 19)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      if (this.enableConsoleOutput) {
        console.log('📁 Logs downloaded');
      }
    }
  }

  async showLogs() {
    // Force save pending logs before showing
    await this.saveLogs();
    
    const logsText = await this.exportLogs();
    if (this.enableConsoleOutput) {
      console.log('📋 Complete logs:');
      console.log(logsText);
    }
    return logsText;
  }

  // Cleanup method - call this when app is closing
  destroy() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    // Force save any pending logs
    this.saveLogs();
  }
}

export const logger = new LoggerService();
