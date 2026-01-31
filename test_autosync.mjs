import { ethereumService } from './server/services/ethereumService.js';

async function testAutoSync() {
    try {
        console.log('🔄 Testing auto-sync...');
        
        await ethereumService.init();
        
        // Manually trigger the auto-sync
        const result = await ethereumService.performNode1Node2AutoSync();
        
        console.log('✅ Auto-sync result:', result);
        
    } catch (error) {
        console.error('❌ Auto-sync failed:', error);
    }
}

testAutoSync();
