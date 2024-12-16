import { Hardware } from "./Hardware";
import { Interrupt } from "./imp/Interrupt";
import { PriorityQueue } from "./PriorityQueue";

export class InterruptControl extends Hardware {
  // Static class variables for managing interrupts and devices
  static hasInterrupts: boolean = false;
  static interruptDevices: Interrupt[] = [];
  static interruptQueue: PriorityQueue = new PriorityQueue();

  // Maximum number of interrupt devices
  private static MAX_DEVICES: number = 5;

  // Adds a new interrupt-driven device to the controller
  public static addDevice(newDevice: Interrupt): void {
    if (InterruptControl.interruptDevices.length < InterruptControl.MAX_DEVICES) {
      InterruptControl.interruptDevices.push(newDevice);
    } else {
      console.log("Max devices reached. Cannot add more interrupt devices.");
    }
  }

  // Stops all devices by clearing the interrupt devices array
  public static stopDevices(): void {
    InterruptControl.interruptDevices = [];
  }

  // Accepts an interrupt by adding a new item to the interrupt queue
  public static acceptInterrupt(key: string, priority: number): void {
    InterruptControl.hasInterrupts = true;
    InterruptControl.interruptQueue.enqueue(key, priority);
  }

  // Displays the current interrupt queue
  public static runQueue(): void {
    if (InterruptControl.hasInterrupts) {
      InterruptControl.interruptQueue.displayQueue();
    }
  }

  // Supplies the highest priority interrupt by dequeuing from the interrupt queue
  public static supplyInterrupt(): string | null {
    const output = InterruptControl.interruptQueue.dequeue();
    if (InterruptControl.interruptQueue.size === 0) {
      InterruptControl.hasInterrupts = false;
    }
    return output;
  }
}
