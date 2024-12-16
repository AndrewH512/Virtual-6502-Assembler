import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

export class Clock extends Hardware {
    // This array is suppose to store registered ClockListeners
    private listeners: ClockListener[] = [];
    private clockIntervalId: NodeJS.Timeout;

    constructor() {
        super(0, "CLK");
    }

    // Add a clock listener to the list
    public addClockListener(listener: ClockListener): void{
        this.listeners.push(listener);

    }

    // "Send Pulse" class
    // Method to start the clock with a specified interval
    public startClock(): void {
        this.log("Clock started");
        this.clockIntervalId = setInterval(() =>{
            // Notify all listeners
            //this.log("Clock pulse Initialized");
            this.listeners.forEach(listener => listener.pulse());
        }, 300);
    }

    // Stops the clock
    // Want to implment this to stop the clock and not run in an infinite loop for testing
    // Not sure if I need this though..
    public stopClock(): void {
        if (this.clockIntervalId) {
            clearInterval(this.clockIntervalId);
            this.log("Clock stopped");
        }
    }

}
