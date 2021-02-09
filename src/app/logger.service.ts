import { Injectable } from '@angular/core';

export enum LogLevel {
    All = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Fatal = 5,
    Off = 6
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  level: LogLevel;
  logWithDate: boolean;
  constructor() {
    this.level = LogLevel.All;
    this.logWithDate = false;
  }

  debug(msg: any, file: any, ...optionalParams: any[]) {
    msg = JSON.stringify(msg);
    this.writeToLog(msg, LogLevel.Debug, file.constructor.name, optionalParams);
  }

  info(msg: any, file: string, ...optionalParams: any[]) {
    msg = JSON.stringify(msg);
    this.writeToLog(msg, LogLevel.Info, file, optionalParams);
  }

  warn(msg: any, file: string, ...optionalParams: any[]) {
    msg = JSON.stringify(msg);
    this.writeToLog(msg, LogLevel.Warn, file, optionalParams);
  }

  error(msg: any, file: string, ...optionalParams: any[]) {
    msg = JSON.stringify(msg);
    this.writeToLog(msg, LogLevel.Error, file,  optionalParams);
  }

  fatal(msg: any, file: string, ...optionalParams: any[]) {
    msg = JSON.stringify(msg);
    this.writeToLog(msg, LogLevel.Fatal, file, optionalParams);
  }

  writeToLog(msg: any, level: LogLevel, file: string, params: any[]): void{
    if (this.shouldLog(level)) {
      let value: string = "";

      // Build log string
      if (this.logWithDate) {
        value = new Date() + " - ";
      }
      value += "Type: " + LogLevel[level];
      value += " - File: " + file;
      value += " - Message: " + msg;
      if (params.length) {
        value += " - Extra Info: " + this.formatParams(params);
      }

      // Log the value
      console.log(value);
    }

  }

  private shouldLog(level: LogLevel): boolean {
    let ret: boolean = false;
    if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.All) {
      ret = true;
    }
    return ret;
  }

  private formatParams(params: any[]): string {
    let ret: string = params.join(",");
    
    // Is there at least one object in the array?
    if (params.some(p => typeof p == "object")) {
        ret = "";
        
        // Build comma-delimited string
        for (let item of params) {
            ret += JSON.stringify(item) + ",";
        }
    }
    return ret;
}



}
