import { Interrupt } from "./imp/Interrupt";
import { Hardware } from "./Hardware";
import { PriorityQueue} from "./PriorityQueue";
import { InterruptControl } from "./InterruptControl";

export class Keyboard extends Hardware implements Interrupt {
    irq: number;
    priority: number;
    name: string;
    outputBuffer : PriorityQueue;
  
    constructor(newid: number, newNumber: string) {
      super(newid, newNumber);
      this.irq = 1;
      this.priority = 5;
      this.name = "Keyboard";
      this.outputBuffer = new PriorityQueue();
    }
  
    public monitorKeys() {
  
        var stdin = process.stdin;

        // without this, we would only get streams once enter is pressed
        stdin.setRawMode( true );

        // resume stdin in the parent process (node app won't quit all by itself
        // unless an error or process.exit() happens)
        stdin.resume();

        // i don't want binary, do you?
        //stdin.setEncoding( 'utf8' );
        stdin.setEncoding(null);


        stdin.on( 'data', function( key ){
            //let keyPressed : String = key.charCodeAt(0).toString(2);
            //while(keyPressed.length < 8) keyPressed = "0" + keyPressed;
            let keyPressed: string = key.toString();

            this.log("Key pressed - " + keyPressed);

            // ctrl-c ( end of text )
            // this let's us break out with ctrl-c
            if ( key.toString() === '\u0003' ) {
                process.exit();
            }

            // write the key to stdout all normal like
            //process.stdout.write( key);
            // put the key value in the buffer
            // 5 = Keyboard Priority
            this.outputBuffer.enqueue(keyPressed, this.priority);

            // set the interrupt!
            InterruptControl.acceptInterrupt(keyPressed, this.priority);

            // .bind(this) is required when running an asynchronous process in node that wishes to reference an
            // instance of an object.
        }.bind(this));
    }
}