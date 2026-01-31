import fetch from 'node-fetch';

async function triggerSync() {
    try {
        console.log('🔄 Triggering manual sync...');
        
        const response = await fetch('http://localhost:5000/api/blockchain/sync-nodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log('✅ Sync result:', result);
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

triggerSync();
