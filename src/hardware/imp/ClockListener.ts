export interface ClockListener {
    // Method that will notify all registered hardware when a clock pulse occurs.
    pulse(): void;
}