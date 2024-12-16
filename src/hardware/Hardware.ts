// The Hardware class serves as a base class (superclass) for all hardware components.
export class Hardware {
    // Memebers to keep track of ID Number and Names of all hardware
    name: string;
    id: number;
    
    
    // Memeber to can be used to turn on and off debugging
    debug: boolean = true;

    // This constructor initializes the id and name for the hardware
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    // Lab 0 Part 11, public method that subclasses can use called log()
    public log(message: string): void {
        if (this.debug) {
            // To get the current time:
            const timestamp = Date.now();
            // The output display when method is used, should display as Name, id:0,Current Time
            console.log(`[HW - ${this.name} Id: ${this.id} - ${timestamp}]: ${message}`);
        }
    }

    // This method allows us to toggle the debug flag.
    public setDebug(debug: boolean): void {
        this.debug = debug;
    }

    // Method to convert a number to hexadecimal string
    public hexLog(num: number, length: number): string {
        return num.toString(16).toUpperCase().padStart(length, '0');
    }
}