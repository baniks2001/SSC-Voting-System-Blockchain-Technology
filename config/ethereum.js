import dotenv from 'dotenv';
dotenv.config();

export const ETHEREUM_CONFIG = {
    nodes: [
        {
            name: "node1",
            rpcUrl: process.env.ETHEREUM_NODE1_URL || "http://localhost:8545",
            wsUrl: "ws://localhost:8546",
            chainId: parseInt(process.env.ETHEREUM_CHAIN_ID) || 1337,
            account: process.env.ETHEREUM_NODE1_ACCOUNT || "",
            privateKey: process.env.ETHEREUM_NODE1_PRIVATE_KEY || "",
            password: process.env.ETHEREUM_NODE1_PASSWORD || "password"
        },
        {
            name: "node2", 
            rpcUrl: process.env.ETHEREUM_NODE2_URL || "http://localhost:8547",
            wsUrl: "ws://localhost:8548",
            chainId: parseInt(process.env.ETHEREUM_CHAIN_ID) || 1337,
            account: process.env.ETHEREUM_NODE2_ACCOUNT || "",
            privateKey: process.env.ETHEREUM_NODE2_PRIVATE_KEY || "",
            password: process.env.ETHEREUM_NODE2_PASSWORD || "password"
        }
    ],
    contractAddress: process.env.VOTING_CONTRACT_ADDRESS || "",
    gasLimit: parseInt(process.env.ETHEREUM_GAS_LIMIT) || 6721975,
    gasPrice: parseInt(process.env.ETHEREUM_GAS_PRICE) || 0,
    fallbackTimeout: 3000
};