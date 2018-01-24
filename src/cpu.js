/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT  = 0b00011011; // Halt CPU
// !!! IMPLEMENT ME
const LDI = 0b00000100; // Set the value of a register.
const ADD = 0b00001100;
const SUB = 0b00001101; // SUB
const MUL = 0b00000101; // MUL
const DIV = 0b00001110; // DIV
const PRN = 0b00000110; // Print
const PUSH = 0b00001010; // Push Register
const POP = 0b00001011; // Pop Register
const CALL = 0b00001111;
const RET = 0b00010000; // Return from subroutine.
const JMP = 0b00010001; // Jump to the address stored in the given register.
/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers
        
        this.reg[7] = 0xF8;

        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register

		this.setupBranchTable();
    }
	
	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
		let bt = {};

        bt[HLT] = this.HLT;
        bt[LDI] = this.LDI;
        bt[ADD] = this.ADD;
        bt[SUB] = this.SUB;
        bt[MUL] = this.MUL;
        bt[DIV] = this.DIV;
        bt[PRN] = this.PRN;
        bt[PUSH] = this.PUSH;
        bt[POP] = this.POP;
        bt[RET] = this.RET;
        bt[JMP] = this.JMP;
        bt[CALL] = this.CALL;
		this.branchTable = bt;
	}

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     * 
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'ADD':
                this.reg[regA] += this.reg[regB] & 0b11111111;
                break;
            case 'SUB':
                this.reg[regA] -= this.reg[regB] & 0b11111111;
                break;
            case 'MUL':
                this.reg[regA] *= this.reg[regB] & 0b11111111;
                break;
            case 'DIV':
                if (this.reg[regB] === 0) {
                    console.log("error: can't divide by zero");
                    this.stopClock();
                }
                this.reg[regA] /= this.reg[regB];
                break
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // !!! IMPLEMENT ME

        // Load the instruction register from the current PC
        this.reg.IR = this.ram.read(this.reg.PC);
        // Debugging output
        console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, jump to the
        // appropriate hander in the branchTable
        const handler = this.branchTable[this.reg.IR];
        // Check that the handler is defined, halt if not (invalid
        // instruction)
        if (!handler) {
            console.error('Invalid instructions at address ' + this.reg.PC + ' ' + this.reg.IR);
            this.stopClock();
            return;
        }
        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        handler.call(this);
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * HLT
     */
    HLT() {
        // !!! IMPLEMENT ME
        this.stopClock();
    }

    /**
     * LDI R,I
     */
    LDI() {
        const regA = this.ram.read(this.reg.PC + 1);
        const val = this.ram.read(this.reg.PC + 2); // immediate
        this.reg[regA] = val;
        this.reg.PC += 3;
    }

    /**
     * SUB R,R
     */
    ADD() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('ADD', regA, regB);
        
        this.reg.PC += 3;
    }

     /**
     * SUB R,R
     */
    SUB() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('SUB', regA, regB);
        
        this.reg.PC += 3;
    }

    /**
     * MUL R,R
     */
    MUL() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('MUL', regA, regB);
        
        this.reg.PC += 3;
    }
    /**
     * DIV R,R
     */
    DIV() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('DIV', regA, regB);
        
        this.reg.PC += 3;
    } 
    /**
     * PRN R
     */
    PRN() {
        console.log(this.reg[this.ram.read(this.reg.PC + 1)]);
        this.reg.PC += 2;
    }

    PUSH() {
        const regA = this.ram.read(this.reg.PC + 1);
        this.reg[7]--; // dec r7;
        this.ram.write(this.reg[7], this.reg[regA]);
        this.reg.PC += 2;
    }

    POP() {
        this.reg[this.ram.read(this.reg.PC + 1)] = this.ram.read(this.reg[7]);
        this.reg[7]++;
        this.reg.PC += 2;
    }

    /**
     * CALL R
     */
    CALL() {
        const regA = this.ram.read(this.reg.PC + 1);
        this.reg[7]--;
        this.ram.write(this.reg[7], this.reg.PC + 2);
        this.reg.PC = this.reg[regA];
    }

     /**
     * RET R
     */
    RET() {
        this.reg.PC = this.ram.read(this.reg[7]);
        this.reg[7]++;
    }

     /**
     * JMP R
     */
    JMP() {
        const regA = this.ram.read(this.reg.PC + 1);
        this.reg.PC = this.reg[regA];
    }
}

module.exports = CPU;
