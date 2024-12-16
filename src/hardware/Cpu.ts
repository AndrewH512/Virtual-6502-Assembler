import { System} from "../System"
import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import { MMU }  from "./MMU";
import { InterruptControl } from "./InterruptControl";
import { Ascii } from "./Acsii";

// Enum for different steps the CPU can be in the cycle
enum Steps { fetch, decode, execute, writeback, interruptCheck}

export class Cpu extends Hardware implements ClockListener{
    // Array of Opcodes
    oneByte : number [] = new Array;
    twoByte : number [] = new Array;
    noByte : number [] = new Array;

    // Added Members to represent registers and flags
    accumulator: number;
    xRegister: number;
    yRegister: number ;
    programCounter: number;
    instructionRegister;
    zeroFlag: boolean; // 0: false, 1: true
    pipelineStep: number = 0; // Track pipeline progress
    overflowFlag : boolean = false;

    // CPU-specific members
    currentStep: Steps;
    private _mmu: MMU = null;
    decode1: boolean = true;
    decode2: boolean = false;
    excute1: boolean = true;
    CPU_DebugFlag: boolean = false; // Flag for Debugging, Set to True to See

    // Member to keep track of the CPU clock count.
    cpuClockCount: number = 0;

    // The constructor initializes the Cpu instance by calling the parent hardware constructor with a predefined id and name
    constructor(systemMMU: MMU) {
        super(0, "CPU");

        this.accumulator = 0x00; // Holds Data
        this.cpuClockCount = 0; // Keeps track of how many clock cycles
        this._mmu = systemMMU; // System Memory
        this.xRegister = 0x00; // Holds Data
        this.yRegister = 0x00; // Holds Data
        this.zeroFlag = false; // For Comparsions
        this.currentStep = Steps.fetch; // Start on Fetch


        this.instructionRegister = 0x0000;
        this.programCounter = 0x00; // Holds Instructions

        // Array to denote Operand-quantity instructions
        //this.noByte = [0xFF]; 
        this.oneByte = [0xA9, 0xA2, 0xA0, 0xD0];
        this.twoByte = [0xAD, 0x8D, 0x6D, 0xAE, 0xAC, 0xEC, 0xEE, 0xFF];

    }

    // Start of Pipeline: 
    // Includes, Fetch, Decode( Possbiley 2), Execute ( Possbiley 2), Interruptcheck
    // Fetch the next instruction from memory
    public fetch(): void {
        // Set the Memory Address Register (MAR) to the program counter
        this._mmu.changeMAR(this.programCounter);

        // Read the instruction from memory into the MDR
        this._mmu.read();

        // Move the value from the MDR to the instruction register
        this.instructionRegister = this._mmu.get_MDR();
        
        // Debugging to see if fetching is working as expected
        if (this.CPU_DebugFlag){
            this.log(`Fetched instruction: ${this.hexLog(this.instructionRegister, 2)}`);
        }
        
        // Increment the program counter to point to the next instruction
        this.programCounter += 1;
        
    }

    // Decode the newly fetch instruction
    public decode(): void {
        // Log the start of the Decode phase for debugging
        if (this.CPU_DebugFlag){
            this.log('Starting Decode');
        }

        // Special Check for FF, If its a case 1 or case 2 skip the decode phase, only need decode for phase 3
        if (this.instructionRegister== 0xFF && (this.xRegister == 0x01 || this.xRegister == 0x02)) {
            if (this.CPU_DebugFlag){
                {console.log("Skip Decode");}
                this.execute();
            }
        }else

        // Check if the current opcode is a 2-operands instruction
        if (this.TwoByte()) {
            if (this.decode1) {
                // Set Little Endian flag 
                this._mmu.set_LittleFlag();
                // Set the MAR to the program counter address
                this._mmu.changeMAR(this.programCounter);
                // Read the data at the current MAR into MDR
                this._mmu.read();
                // Add to program counter
                this.programCounter++;
                // Toggle the decode1 flag to handle the second byte on the next decode call
                this.decode1 = false;

                this.currentStep = Steps.decode;
            } else {
                // Handle the second byte of the instruction

                // Set the MAR to the current program counter address
                this._mmu.changeMAR(this.programCounter);
                // Read the data at the MAR into the MDR
                this._mmu.read();
                // Add to program counter
                this.programCounter++;
                // Reset the decode1 flag to prepare for the next instruction
                this.decode1 = true;
            }
        }
        // Check if the current opcode is a 1-operand instruction
        else if (this.OneByte()) {
            // Set the MAR to the program counter address
            this._mmu.changeMAR(this.programCounter);
            // Read the data at the MAR into the MDR
            this._mmu.read();
            // Add 1 to program counter
            this.programCounter++;
        }
        // If it's neither 2-operand nor 1-operand, it must be a 0-operand instruction
        else {
            if (this.CPU_DebugFlag){
                this.log("0 Operand Instruction, Skip Decode");
            }
            // Directly execute the instruction without further decoding
            this.currentStep = Steps.interruptCheck;
            this.execute();
        }
    }

     // Excute Function
     public execute(): void {
        if(this.CPU_DebugFlag){
            this.log(`In Excute`);
        }
        switch (this.instructionRegister){
            case 0xA9:  // We need to load the accumlater with a constant
                this.accumulator = this._mmu.get_MDR();
                break;
            case 0xAD:  // Load the accumulator from memory
                this.accumulator = this._mmu.get_MDR();
                break;
            case 0x8D: //  Store the accumulator in memory
                this._mmu.changeMDR(this.accumulator);
                this.currentStep = Steps.writeback;
                break;
            case 0x8A: //  Load the accumulator from X register
                this.accumulator = this.xRegister;
                break;
            case 0x98: //  Load the accumulator from Y register
                this.accumulator = this.yRegister;
                break;
            case 0x6D: // Add with Carry (Accu += value from Memory Register)
                // Retrieve values from the accumulator and memory data register
                let first_number = this.accumulator;
                let second_number = this._mmu.get_MDR();
            
                // Handle signed representation for the accumulator and memory data
                first_number = (first_number >= 0x80) ? first_number - 0x100 : first_number;
                second_number = (second_number >= 0x80) ? second_number - 0x100 : second_number;
            
                // Perform addition
                let result = first_number + second_number;
            
                // Overflow detection and correction
                if (result < -128) {
                    // Negative overflow
                    result = 0x100 + result;
                    this.overflowFlag = true;
                } else if (result > 127) {
                    // Positive overflow
                    result -= 0x100;
                    this.overflowFlag = true;
                } else {
                    // No overflow, reset overflow flag
                    this.overflowFlag = false;
                }
            
                // Store the result back in the accumulator (convert to unsigned 8-bit)
                this.accumulator = result & 0xFF;

                // For Testing, See the result of the accumulator
                if(this.CPU_DebugFlag){
                    console.log(this.accumulator);
                }
                break;
            case 0xA2: // Load the X register with a constant
                this.xRegister = this._mmu.get_MDR();
                break;
            case 0xAE: // Load the X register with a value from memory
                this.xRegister = this._mmu.get_MDR();
                break;
            case 0xAA: // Load the X register from the accumulator
                this.xRegister = this.accumulator;
                break;
            case 0xA0: // Load the Y register with a constant
                this.yRegister = this._mmu.get_MDR();
                break;
            case 0xAC: // Load the Y register from memory
                this.yRegister = this._mmu.get_MDR();
                break;
            case 0xA8: // Load the Y register from the accumulator
                this.yRegister = this.accumulator
                break;
            case 0xEA:  // No Operation
                // This should be it??
                // Seems wayyy too simple lol
                break;
            case 0x00:  // break
                // Show the results in console
                System.stopSystem();
                break;
            case 0xEC: // Comparing a Byte in memory to the x reg. Sets the Z (zero) flag if equal
                this.zeroFlag = (this.xRegister == this._mmu.get_MDR());
                break;
            case 0xD0: // Branch n bytes if Z Flag = false
                if (!this.zeroFlag) { 
                    // Fetch the offset value
                    const offset = this._mmu.get_MDR(); 
                    // Handle signed offset
                    // If offset is great than 127 (0x7F), the value is negative in signed
                    // The offset is converted into its negative equivalent, 
                    // 0x100 represents 256 so, 256-offset gives the correct negative value
                    //Otherwise if the offset is less than 0x7F, its already postive
                    const goback = (offset > 0x7F) ? -(0x100 - offset) : offset; 

                    // Testing Log to see the program counter before the branch
                    if(this.CPU_DebugFlag){
                        console.log(`${this.programCounter} Before`);
                    }
                    
                    // Adjust the program counter
                    this.programCounter += goback; 

                    // Testing log to see program counter after
                    if(this.CPU_DebugFlag){
                        console.log(`${this.programCounter} After`);
                    }
                }
                break;
            case 0xEE: // Increments the vlaue of a byte stored in memory
                // Requires the most clock cycles, and a write back
                if (this.excute1) {
                    // Get the MDR
                    this.accumulator = this._mmu.get_MDR();

                    // Reset the execute flag for the next step.
                    this.excute1 = false;

                    // Proceed to the execution step.
                    this.currentStep= Steps.execute;
                 } else {
                    // Increment the accumulator value.
                    this.accumulator++;

                    // Check for overflow 
                    if (this.accumulator == 0x100) {
                      // Wrap around to 0.
                      this.accumulator = 0x00;
                      // Set the overflow flag to indicate the condition.
                      this.overflowFlag = true;
                    }

                    // Write the updated value back to memory.
                    this._mmu.changeMDR(this.accumulator);

                    // Reset the execution flag for the next cycle
                    this.excute1 = true;

                    // Write back
                    this.currentStep= Steps.writeback;
                 }
                 break;
            case 0xFF: {
                const x = this.xRegister;
                // If there is a 1 in the X register, print the integer in the Y register
                if (x === 0x01) { 
                    // Print Y Register as a hexadecimal value
                    process.stdout.write(this.hexLog(this.yRegister, 4) + '\n');
                // X Register = 2, Print the 0x00 terminated string stored at address in the Y register
                // X Register = 3, Print the 0x00 terminated string from the address in the operand
                } else if (x === 0x02 || x === 0x03) { 
                    // Determine starting address for memory read
                    let startAddress;
                    if (x === 0x02) {
                        startAddress = (this.programCounter < 0x100)
                        ? this.yRegister
                        : (Math.floor(this.programCounter / 0x100) * 0x100 + this.yRegister);
                    } else {
                        startAddress = this._mmu.get_MAR();
                    }
                
                    // Iterate through memory until null character (0x00)
                    this._mmu.changeMAR(startAddress);
                    this._mmu.read();
                    let byteValue = this._mmu.get_MDR();
                
                    while (byteValue !== 0x00) {
                        process.stdout.write(Ascii.byteToChar(byteValue));
                        this._mmu.changeMAR(this._mmu.get_MAR() + 1);
                        this._mmu.read();
                        byteValue = this._mmu.get_MDR();
                    }
                }
                // Move to the next fetch step
                this.currentStep = Steps.fetch;
                break;
            }
        }
    }

    // Write the result back 
    public writeBack(): void {
        if(this.CPU_DebugFlag){
            this.log(`In writeback`);
        }
        this._mmu.write();
    }

    // Iterrupt Check
    public interruptCheck(): void {
        if (InterruptControl.hasInterrupts) {
            InterruptControl.runQueue();
            
            // Show what is being dequeue
            console.log("Dequeue:  " + InterruptControl.supplyInterrupt());
            this.currentStep = Steps.interruptCheck;
           }
        else{
            // Else we are done and the Cycle is done
            if(this.CPU_DebugFlag){
                this.log(`Interrupt check - cycle completed.`);
            }
        }
    }

    // This method will be called when the clock pulses.
    public pulse(): void {

        // Trying to simulate one clock cycle in the pipeline
        // Check if the current step is the fetch step
        if (this.currentStep === Steps.fetch){
            // Fetch the instruction from memory or input
            this.fetch();
            // Next Step
            this.currentStep = Steps.decode;
          } else
          // Check if the current step is the decode step
          if (this.currentStep === Steps.decode){
            // Move to the execute step
            this.currentStep = Steps.execute;
            // Decode the fetched instruction
            this.decode();
          } else
          // Check if the current step is the execute step
          if (this.currentStep === Steps.execute){
             // Move to the interrupt check step
            this.currentStep = Steps.interruptCheck;
            // Execute the decoded instruction
            this.execute();
          } else
          // Check if the current step is the write-back step
          if (this.currentStep === Steps.writeback){
            // Write the results of execution back to memory or registers
            this.writeBack();
            // Move to the interrupt check step
            this.currentStep = Steps.interruptCheck;
          } else { 
            // Interrupt Check
            // Reset to the fetch step for the next cycle
            this.currentStep = Steps.fetch;
            // Check and handle any pending interrupts
            this.interruptCheck();
          }

        if (this.instructionRegister != 0x00){
            // Logs the results 
            this.logPulse();
         }
 
        // Increment the clock count each time a pulse occurs.
        this.cpuClockCount++;
    

        // Log the clock pulse and current clock count.
        //this.log(`received clock pulse - CPU Clock Count: ${this.cpuClockCount}`);
    }

    // This function checks if the current instruction register matches any two-byte opcode in the twoByte array.
    // It iterates through each item in the twoByte array, and if a match is found, it returns `true`.
    // If no match is found after checking all the opcodes, it returns `false`.
    TwoByte(): boolean {
        for (let i = 0; i < this.twoByte.length; i++) {
        if (this.instructionRegister == this.twoByte[i]) {
          return true;
          }
        }
        return false;
      }
    // This function checks if the current instruction register matches any one-byte opcode in the oneByte array.
    // It follows the same logic as the previous function but checks against the oneByte array instead.
    // If a match is found, it returns `true`, and if no match is found, it returns `false`.
    OneByte(): boolean {
        for (let i = 0; i < this.oneByte.length; i++) {
        if (this.instructionRegister == this.oneByte[i]) {
          return true;
          }
        }
        return false;
      }

    // Logs the results every cycle
    private logPulse(): void {
        this.log(
            `Clock Cycle=${this.cpuClockCount.toString().padStart(3, ' ')}, ` +
            `IR=${this.hexLog(this.instructionRegister, 2).padStart(4, ' ')}, ` +
            `PC=${this.hexLog(this.programCounter, 4).padStart(6, ' ')}, ` +
            `A=${this.hexLog(this.accumulator, 2).padStart(4, ' ')}, ` +
            `X=${this.hexLog(this.xRegister, 2).padStart(4, ' ')}, ` +
            `Y=${this.hexLog(this.yRegister, 2).padStart(4, ' ')}, ` +
            `Z=${this.zeroFlag ? "Set  " : "Clear"}, ` +
            `V=${this.overflowFlag ? "Set  " : "Clear"}, ` +
            `MAR=${this.hexLog(this._mmu.get_MAR(), 4).padStart(6, ' ')}, ` +
            `MDR=${this.hexLog(this._mmu.get_MDR(), 2).padStart(4, ' ')}, ` +
            `Step=${Steps[this.currentStep].padEnd(2, ' ')}`
        );
    }
}