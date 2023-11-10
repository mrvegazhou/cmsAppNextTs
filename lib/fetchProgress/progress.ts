
import speedometer from './speedometer';

type IProgress = {
    total: number;
    transferred: number;
    speed: number;
    eta: number;
    remaining: number;
    percentage: number;
}
export default class Progress {

    length: number;
    transferred: number;
    streamSpeed: any;
    speed: number;
    initial: boolean;
    emitDelay: number;
    eventStart: number;
    percentage: number;

    constructor(length: number, emitDelay:number = 1000) {
        this.length = length || 0;
        this.transferred = 0;
        this.speed = 0;
        this.streamSpeed = speedometer(this.speed || 5000);
        this.initial = false;
        this.emitDelay = emitDelay;
        this.eventStart = 0;
        this.percentage = 0;
    }

    getRemainingBytes() {
        return this.length - this.transferred;
    }

    getEta() {
        return this.length >= this.transferred
          ? this.getRemainingBytes() / this.speed * 1000000000
          : 0;
    }

    flow(chunk: Uint8Array, onProgress: (p:IProgress)=>void) {
        const chunkLength = chunk.length;
        this.transferred += chunkLength;
        this.speed = this.streamSpeed(chunkLength);
        this.percentage = Math.round(this.transferred / this.length * 100);
        if (!this.initial) {
          this.eventStart = Date.now();
          this.initial = true;
        }
        if (
          this.length >= this.transferred ||
          Date.now() - this.eventStart > this.emitDelay
        ) {
          this.eventStart = Date.now();
    
          const progress: IProgress = {
              total: this.length,
              transferred: this.transferred,
              speed: this.speed,
              eta: this.getEta(),
              remaining: 0,
              percentage: 0
          };
          if (this.length) {
            progress.remaining = this.getRemainingBytes();
            progress.percentage = this.percentage;
          }
          onProgress(progress);
        }
    }
}