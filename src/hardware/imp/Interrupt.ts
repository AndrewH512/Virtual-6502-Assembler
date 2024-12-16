import { PriorityQueue } from "../PriorityQueue";

export class Interrupt{
  // IRQ number assigned to the device
  irq: number; 
  // Priority level
  priority: number; 
  // Name of the device
  name: string; 
  outputBuffer? : PriorityQueue;
  inputBuffer? : PriorityQueue;

}