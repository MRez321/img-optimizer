const fs = require('fs');
const drugModel = require('../models/drugModel');

(async () => {
    try {
        const all = await drugModel.getAll(true); // include deleted
        fs.writeFileSync('./databaseDump.json', JSON.stringify(all, null, 2));
        console.log('✅ Snapshot saved to databaseDump.json');
    } catch (err) {
        console.error('❌ Error creating snapshot:', err);
    }
})();
