export class Ascii {
  // Manually defined object for byte-to-character mapping
  private static asciiMap: { [key: number]: string } = {
      0: '\0', 1: '\u0001', 2: '\u0002', 3: '\u0003', 4: '\u0004', 5: '\u0005',
      6: '\u0006', 7: '\u0007', 8: '\b', 9: '\t', 10: '\n', 11: '\u000B',
      12: '\f', 13: '\r', 14: '\u000E', 15: '\u000F', 16: '\u0010', 17: '\u0011',
      18: '\u0012', 19: '\u0013', 20: '\u0014', 21: '\u0015', 22: '\u0016',
      23: '\u0017', 24: '\u0018', 25: '\u0019', 26: '\u001A', 27: '\u001B',
      28: '\u001C', 29: '\u001D', 30: '\u001E', 31: '\u001F', 32: ' ', 
      33: '!', 34: '"', 35: '#', 36: '$', 37: '%', 38: '&', 39: "'",
      40: '(', 41: ')', 42: '*', 43: '+', 44: ',', 45: '-', 46: '.',
      47: '/', 48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5',
      54: '6', 55: '7', 56: '8', 57: '9', 58: ':', 59: ';', 60: '<',
      61: '=', 62: '>', 63: '?', 64: '@', 65: 'A', 66: 'B', 67: 'C',
      68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H', 73: 'I', 74: 'J',
      75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P', 81: 'Q',
      82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X',
      89: 'Y', 90: 'Z', 91: '[', 92: '\\', 93: ']', 94: '^', 95: '_',
      96: '`', 97: 'a', 98: 'b', 99: 'c', 100: 'd', 101: 'e', 102: 'f',
      103: 'g', 104: 'h', 105: 'i', 106: 'j', 107: 'k', 108: 'l', 109: 'm',
      110: 'n', 111: 'o', 112: 'p', 113: 'q', 114: 'r', 115: 's', 116: 't',
      117: 'u', 118: 'v', 119: 'w', 120: 'x', 121: 'y', 122: 'z', 123: '{',
      124: '|', 125: '}', 126: '~', 127: '\u007F'
  };

  // Reverse the object for character-to-byte mapping manually
  private static reverseAsciiMap: { [key: string]: number } = (() => {
      const reverseMap: { [key: string]: number } = {};
      for (const byte in Ascii.asciiMap) {
          reverseMap[Ascii.asciiMap[byte]] = parseInt(byte);
      }
      return reverseMap;
  })();

  // Converts a byte (number) to its corresponding ASCII character manually using the object
  static byteToChar(byte: number): string {
      if (byte < 0 || byte > 127) {
          throw new Error("Invalid byte: out of ASCII range.");
      }
      return this.asciiMap[byte] || ''; // Manually return the corresponding character
  }

  // Converts a single character to its corresponding byte number manually using the reverse object
  static charToByte(char: string): number {
      if (char.length !== 1) {
          throw new Error("Invalid character: input should be a single character.");
      }
      return this.reverseAsciiMap[char] || -1; // -1 if the character isn't in the map
  }

  // Converts a string (array of characters) to an array of bytes manually
  static stringToBytes(str: string): number[] {
      let bytes: number[] = [];
      for (let i = 0; i < str.length; i++) {
          bytes.push(this.charToByte(str.charAt(i)));
      }
      return bytes;
  }

  // Converts an array of bytes to a string 
  static bytesToString(bytes: number[]): string {
      let str = "";
      for (let i = 0; i < bytes.length; i++) {
          if (bytes[i] === 0) break; // Stop at null terminator
          str += this.byteToChar(bytes[i]);
      }
      return str;
  }

  // Check if a byte corresponds to a printable ASCII character 
  static isPrintable(byte: number): boolean {
      return byte >= 32 && byte <= 126;
  }

  // Convert newline character manually, handling \n and \r
  static convertNewline(input: string): string {
      let result = '';
      for (let i = 0; i < input.length; i++) {
          if (input[i] === '\n') {
              result += '\r\n'; // Insert \r before \n
          } else {
              result += input[i];
          }
      }
      return result;
  }
}