import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsPath = path.resolve(__dirname, '../artifacts');
if (!fs.existsSync(artifactsPath)) {
    fs.mkdirSync(artifactsPath, { recursive: true });
}

const contractPath = path.resolve(__dirname, '../contracts/Voting.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Voting.sol': {
            content: source
        }
    },
    settings: {
        evmVersion: 'london',
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        const errors = output.errors.filter(err => err.severity === 'error');
        if (errors.length > 0) {
            console.error('Compilation errors:');
            errors.forEach(err => {
                console.error(err.formattedMessage);
            });
            process.exit(1);
        }
    }

    const contractName = 'Voting';
    const contractFile = output.contracts['Voting.sol'][contractName];
    
    if (!contractFile) {
        throw new Error('Contract not found in compilation output');
    }

    const compilationResult = {
        abi: contractFile.abi,
        bytecode: contractFile.evm.bytecode.object,
    };

    const outputPath = path.resolve(artifactsPath, contractName + '.json');
    fs.writeFileSync(outputPath, JSON.stringify(compilationResult, null, 2));

    console.log('✅ Contract compiled successfully!');
    console.log('📁 ABI and bytecode saved to artifacts/Voting.json');
    console.log('📊 Contract ABI length:', compilationResult.abi.length);
    console.log('🔢 Bytecode length:', compilationResult.bytecode.length);
    console.log('🏭 EVM Version: london');

} catch (error) {
    console.error('❌ Compilation failed:', error.message);
    process.exit(1);
}
