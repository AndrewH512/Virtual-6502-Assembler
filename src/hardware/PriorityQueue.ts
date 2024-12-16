export class PriorityQueue {

    // The head of the queue, which holds the highest-priority element.
    head: Node | null; 

    // Tracks the number of elements in the queue.
    size: number; 
    constructor() {
        this.head = null; // Initialize the queue as empty.
        this.size = 0; // Initial size of the queue is 0.
    }

    // Inserts a new element into the queue
    public enqueue(enq: string, pri: number): void {
        // If the element is 'g', assign it the highest priority.
        if (enq === 'g') {
            // 'g' always has the highest priority
            pri = Infinity; 
        }

        // Create a new node with the given value and priority
        const newNode = new Node(enq, pri);
        if (this.head === null || pri > this.head.priority) {
            // If the queue is empty or the new node has the highest priority
            newNode.next = this.head;
            // Update the head to the new node
            this.head = newNode;
        } else {
            let current = this.head;
             // Traverse the queue until the correct position for the new node is found
            while (current.next !== null && current.next.priority >= pri) {
                current = current.next;
            }
            newNode.next = current.next;
            current.next = newNode;
        }
        this.size++;
    }

    // Removes and return the highest priority element from the queue
    public dequeue(): string | null {
        if (this.head === null) {
            return null;
        }
        const deq = this.head.value;
        this.head = this.head.next;
        this.size--;
        return deq;
    }

    // Function that prints all the elements in queue
    public displayQueue(): void {
        if (this.head) {
            process.stdout.write("Queue [ ");
            let current = this.head;
            while (current) {
                process.stdout.write(`${current.value} `);
                current = current.next;
            }
            process.stdout.write("]\n");
        } else {
            console.log("Queue is empty.");
        }
    }

}


// Node Class: Represents an individual element in the priority queue.
// Each node has a value, a priority, and a reference to the next node.
class Node {
    value: string;
    priority: number;
    next: Node | null;
    
    constructor(value: string, priority: number) {
        this.value = value;
        this.priority = priority;
        this.next = null;
    }
}