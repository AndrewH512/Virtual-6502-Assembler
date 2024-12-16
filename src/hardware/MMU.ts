// MMU.ts
import { Hardware } from "./Hardware";
import { Memory } from "./Memory";
import { Cpu } from "./Cpu";

// Start of MMU
export class MMU extends Hardware {
    // Reference to the Memory object
    private memory: Memory; 

     // Reference to the CPU object
    private cpu: Cpu;        

     // Little Endian Flag:
    private LittleFlag : number[] = new Array(0x2);

    constructor(memory: Memory, cpu: Cpu) {
        // Initialize MMU with an ID and name
        super(0, "MMU");     

        // Store the reference to the Memory
        this.memory = memory;

        // Store the reference to the CPU
        this.cpu = cpu;    

        // Log initialization message
        this.log("Initialized Memory Management Unit");

         // Little Edian Flag, defaults is 0
        this.LittleFlag[0] = 0;
        this.LittleFlag[1] = 0;
    }

    // Initialize static program in memory
    public initializeStaticProgram(): void {
        // Define a simple program
        const program = [
            // My simple program
            //0xA9, 0x0D, 0xAD, 0x1D, 0xA9, 0x2D, 0xA9, 0x3F, 0xA9, 0xFF, 0x00
            
            // addition normal (as high as you can go)
            //0xA9, 0x3F, 0x8D, 0x10, 0x00, 0xA9, 0x40, 0x6D, 0x10, 0x00, 0xA8, 0xA2, 0x01, 0xFF, 0x00

            // Simple Loop Testing, Output: 1234
            //0xA9,0x05,0x8D,0x40,0x00,0xA9,0x01,0x8D,0x41,0x00,0xA8,0xA2,0x01,0xFF, 0x6D,0x41,0x00,0xAA,0xEC,0x40,0x00,0xD0,0xF3,0x00

            // Another test for loops, Output: 124810204000000000000
            //0xA9,0x00,0x8D,0x40,0x00,0xA9,0x01,0x6D,0x40,0x00,0x8D,0x40,0x00,0xA8,
            //0xA2,0x01,0xFF,0xD0,0xF4,0x00
            
            // My lab 2 Program, Output: 011235
            //0xA9, 0x08, 0x8D, 0x53, 0x10, 0xA9, 0x00, 0x8D, 0x50, 0x10, 0xAC, 0x50, 0x10, 0xA2, 0x01, 0xFF, 0xA9, 0x01, 0x8D, 0x51, 0x10, 
            //0xAC, 0x51, 0x10, 0xA2, 0x01, 0xFF, 0xAD, 0x50, 0x10, 0x6D, 0x51, 0x10, 0x8D, 0x52, 0x10, 0xAD, 0x51, 0x10, 0x8D, 0x50, 0x10, 
            //0xAD, 0x52, 0x10, 0x8D, 0x51, 0x10, 0xAD, 0x52, 0x10, 0xAA, 0xEC, 0x53, 0x10, 0xD0, 0xD9, 0x00

            // Powers program in Instruction Set PDF
            //0xA9,0x00,0x8D,0x40,0x00,0xA9,0x,01,0x6D0x40,0x00,0x8D,0x40,0x00,0xA8,0xA2,0x01,0xFF,0xD0,0xF4,0x00

            // 2+2 = 4
            //0xA9, 0x02, 0x8D, 0x10, 0x00, 0x6D, 0x10, 0x00, 0xA2, 0x01, 0xA8, 0xFF, 0x00

            // subtraction direction 1: 5- 3 = 2
            //0xA9, 0x05, 0x8D, 0x10, 0x00, 0xA9, 0xFD, 0x6D, 0x10, 0x00, 0xA8, 0xA2, 0x01, 0xFF, 0x00

            // Hello World!
            0xA2, 0x03, 0xFF, 0x06, 0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F,
            0x72, 0x6C, 0x64, 0x21, 0x0A, 0x00

            // Powers Program in Pipeline Instruction PDF
            //0xA9, 0x00, 0x8D, 0x40, 0x00, 0xA9, 0x01, 0x6D, 0x40, 0x00, 0x8D, 0x40, 0x00, 0xAC, 0x40, 0x00,
            //0xA2, 0x01, 0xFF, 0xA2, 0x03, 0xFF, 0x50, 0x00, 0xD0, 0xED, 0x2C, 0x00

        ];
        
        // Iterate over the program array, then write each byte to memory
        program.forEach((data, index) => {
            this.writeImmediate(0x0000 + index, data);
        });

        // Display memory after loading the program
        this.displayMemoryDump(0x0000, 0x000F); 
    }

    // Display memory dump from a given range
    public displayMemoryDump(start: number, end: number): void {
        // Log memory initialization message
        this.log("Initialized Memory");
        this.log("Memory Dump: Debug");
        this.log("--------------------------------------");
        // Call displayMemory method from the Memory class to show the memory contents
        this.memory.displayMemory(start, end);
        this.log("--------------------------------------");
        this.log("Memory Dump: Complete");
    }


    // Set MAR to a 16-bit address
    public changeMAR(address: number): void {
        // Set the MAR in memory
        this.memory.setMAR(address);

        // Log the address in hexadecimal format
        //this.log(`MAR set to address: ${this.hexLog(address, 4)}`);
    }

    // Changes the MDR
    public changeMDR(data : number) : void {
        this.memory.setMDR(data);
    }  

    // Set MAR from two bytes in little-endian format
    public setMarFromBytes(lowByte: number, highByte: number): void {
         // Combine lowByte and highByte into a 16-bit address (little endian**)
        const address = (highByte << 8) | lowByte;

        // Call setMarFromAddress with the combined address
        this.changeMAR(address);
    }

    // Set Little Endian Flag
    public set_LittleFlag() : void {
        this.LittleFlag[0] = 1; 
    }

    // Read data into the MDR, then store in memory
    public read(): number {
         // Read from memory
        this.memory.read();

        // Check if MDR is a High Order Byte
        if (this.LittleFlag[0] == 2){
            // Format address based on stored Lob and new Hob
             this.LittleFlag[1] += (this.memory.getMDR() * 256);
            // Change MAR to appropriate address, reset leFlag
            this.memory.setMAR(this.LittleFlag[1]);
            // Second read to get the appropriate value into the MDR
            this.memory.read();
            // Reset the flags
            this.LittleFlag[0] = 0;
            this.LittleFlag[1] = 0;
        }
        // Check if MDR is a Low Order Byte
        if (this.LittleFlag[0] == 1) {
            // set address data
            this.LittleFlag[1] = this.memory.getMDR();
            // set flag to 2 (HOB incoming)
            this.LittleFlag[0] = 2;
        }
        
        // Return the value stored in MDR
        return this.memory.getMDR();
    }

    // Write data from the MDR to memory
    public write(): void {
        // Write the value from MDR into memory
        this.memory.write();
    }

    // Write immediate program to the first 10 bytes of memory
    public writeImmediate(address: number, data: number): void {
        // Set the MAR to the given address
        this.memory.setMAR(address);

        // Set the MDR to the provided data
        this.memory.setMDR(data);

        // Write the data to memory
        this.write();
    }

    // Gets value from the MDR
    public get_MDR() : number {
        return this.memory.getMDR();
    }

    // Gets value from the MAR
    public get_MAR() : number {
        return this.memory.getMAR();
    }
}