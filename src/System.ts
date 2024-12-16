import {Cpu} from "./hardware/Cpu";
import {Hardware} from "./hardware/Hardware";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";
import { MMU } from "./hardware/MMU";
import {Keyboard} from "./hardware/Keyboard";
import {InterruptControl} from "./hardware/InterruptControl";

/*
    Constants
 */
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL= 500;               
// This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second                            
// A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,                        
// .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this           
// small, I recommend a setting of 100, if you want to slow things down                                
// make it larger.


export class System extends Hardware {

    private _CPU : Cpu = null;
    private _memory: Memory = null;
    private _clock: Clock;
    private _mmu: MMU;
    private _keyboard: Keyboard; 
    
    public running: boolean = false;

    constructor() {
        super(0, "System");
        // Initialize the CPU, Memory, MMU and CLock instances.
        this._memory = new Memory();
        this._clock = new Clock();
        this._mmu = new MMU(this._memory, null);
        this._CPU = new Cpu(this._mmu);
        this._keyboard = new Keyboard(1, "Keyboard");
        

        // Turn off debugging for the System (This is on by default)
        // Set to false to not see system output, I used this to test turning off system
        this.setDebug(true);
        
        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();

    }

    public startSystem(): boolean {
        // Set this to true to see cpu output
        // Set to false to not see the CPU out as per lab 0
        this._CPU.setDebug(true);

        this._memory.setDebug(true)

        // Log the creation of the system if debug is true
        this.log("created");

        // Log the creation of the cpu if debug is true
        this._CPU.log("created");

        // Add the keyboard
        InterruptControl.addDevice(this._keyboard);

        // Initiate Keyboard functionality (like enabling it to work)
        this._keyboard.monitorKeys();

        // Initialize and Display Memory from 0x00 to 0x14
        this._memory.initializeMemory();

        // Initialize and load the static program
        this._mmu.initializeStaticProgram();

        // Commenting this out for now, this is part of lab 1 to display memory
        //this._memory.displayMemory(0x00, 0x14);  


        // Register CPU and Memory as clock listeners
        this._clock.addClockListener(this._CPU);
        this._clock.addClockListener(this._memory);

        // Start the clock
        this._clock.startClock();

        // We will return true if the system started correctly
        return true;
    }

    public static stopSystem(): boolean {
        console.log("System is Stoping")
        process.exit();
    }
}

let system: System = new System();
