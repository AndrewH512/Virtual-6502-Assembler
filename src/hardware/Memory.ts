import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";

export class Memory extends Hardware implements ClockListener {
    // Array to store memory values, starts as an empty array.
    private memory: number[] = [];
    // Memory Address Register (holds the address)
    private MAR: number = 0x0000;       
    // Memory Data Register (holds the data)
    private MDR: number = 0x00;        

    constructor() {

        // Calling the parent Hardware class constructor, id = 0 and name of "Memory".
        super(0, "RAM");

        // Initialize memory with 0x00 values.
        this.initializeMemory();

        // Log the total addressable space on creation.
        this.log(`Created - Addressable space: ${this.memory.length}`);

    }

    // Resets the memory and registers to 0x00.
    public reset(): void {
        // 65536 bytes of memory initialized to 0x00
        this.memory.fill(0x00); 

        // Reset Memory Address Register
        this.MAR = 0x00;  

        // Reset Memory Data Register
        this.MDR = 0x00;  
    }

    // Getters and setters for MAR and MDR.
    public getMAR(): number {
        return this.MAR;
    }

    public setMAR(address: number): void {
        // Limit address to 16 bits (65536)
        this.MAR = address & 0xFFFF;  
    }

    public getMDR(): number {
        return this.MDR;
    }

    public setMDR(data: number): void {
        this.MDR = data;  
    }

    // Reads the value at the MAR address and stores it in the MDR.
    public read(): void {
        this.MDR = this.memory[this.MAR];
        //this.log(`Read from address ${this.hexLog(this.MAR, 4)}: ${this.hexLog(this.MDR, 2)}`);
    }

    // Writes the value in the MDR to the memory at the MAR address.
    public write(): void {
        // Retrieve data from memory at MAR and store in MDR
        this.memory[this.MAR] = this.MDR;

         // Log the read operation with the address and data in hexadecimal format
        //this.log(`Written to address ${this.hexLog(this.MAR, 4)}: ${this.hexLog(this.MDR, 2)}`);
    }

    // Method to initialize memory
    public initializeMemory(): void {
        // 65536 (64K memory)
        const memorySize = 0x10000; 

        // Auto fill to set all elements to 0
        this.memory = new Array(memorySize).fill(0x00);
    }

    // Function to display memory from 0x00 to 0x14
    // If I Changed this now to go from 0x00 to 0x10000, the error does display
    public displayMemory(start, end): void {
        for (let address = start; address <= end; address++) {
            const value = this.memory[address];
            if (value === undefined) {
                // Outputs error message if the value is undefined.
                this.log(`[Address: ${this.hexLog(address, 4)}] Contains Value: ERR [hexValue conversion]: number undefined`);
            } else {
                // Outputs the memory value in hexadecimal format if it's defined.
                this.log(`[Address: ${this.hexLog(address, 4)}] Contains Value: ${this.hexLog(value, 2)}`);
            }

        }
    }

    // Method will be called when the clock pulses.
    public pulse(): void {
        // Log the clock pulse received by memory.
        //this.log("received clock pulse");
    }
}