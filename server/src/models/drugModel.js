const pool = require('../config/db.ts');

const toBool = (value) => {
    // Check if the value is explicitly the boolean true
    if (value === true) {
        return true;
    }
    // Check if the value is the string 'true'
    if (value === 'true') {
        return true;
    }
    // Check if the value is the number 1
    if (value === 1) {
        return true;
    }
    // Check if the value is the string '1'
    if (value === '1') {
        return true;
    }
    // If none of the above, consider it false
    return false;
};
// --- End of helper function ---


// CRUD for drugs
module.exports = {
    getAll: async (includeDeleted = false) => {
        const [rows] = await pool.query(
            `SELECT * FROM drugs WHERE isDeleted = ? ORDER BY updatedAt DESC`,
            [includeDeleted ? 1 : 0]
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM drugs WHERE id = ?`, [id]);
        return rows[0];
    },

    create: async (drug) => {
        console.log('CREATE drugBrand:', drug.drugBrand); // This log might need adjustment if drugBrand is now an array of objects
        console.log('CREATE drugType:', drug.drugType); // This log might need adjustment if drugType is now an array of objects
        console.log('CREATE drugImg:', drug.drugImg); // This log might need adjustment if drugImg is now an array of filenames

        const sql = `
      INSERT INTO drugs 
      (id, drugName, drugNameP, drugCategory, drugMartindaleCat, drugMedicalCat, drugTags, drugFor, 
       drugFDC, drugOTC, drugOTCDetail, drugExtraDetail, drugHiddenData, drugUse, drugUseOffLabel, drugSideEff, drugConflict, drugPregnancy, drugDemand, 
       drugType, drugBrand, drugImg)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const vals = [
            drug.id,
            drug.drugName,
            drug.drugNameP,
            drug.drugCategory,
            drug.drugMartindaleCat, // New field
            drug.drugMedicalCat,     // New field
            drug.drugTags,
            drug.drugFor,
            toBool(drug.drugFDC), // Use the helper function
            toBool(drug.drugOTC), // Use the helper function
            drug.drugOTCDetail,      // New field
            drug.drugExtraDetail,      // New field
            drug.drugHiddenData,     // New field
            drug.drugUse,
            drug.drugUseOffLabel,
            drug.drugSideEff,
            drug.drugConflict,       // New field
            drug.drugPregnancy,      // New field
            drug.drugDemand,         // New field
            JSON.stringify(drug.drugType), // Assuming drugType is an array of objects like { drugType: '...', drugExtra: '...', drugDose: '...' }
            JSON.stringify(drug.drugBrand), // Assuming drugBrand is an array of objects like { drugBrandName: '...' }
            JSON.stringify(drug.drugImg)    // Assuming drugImg is an array of filenames
        ];
        await pool.query(sql, vals);
    },

    update: async (id, drug) => {
        console.log('UPDATE drugBrand:', drug.drugBrand); // This log might need adjustment
        console.log('UPDATE drugType:', drug.drugType); // This log might need adjustment
        console.log('UPDATE drugImg:', drug.drugImg); // This log might need adjustment

        const sql = `
            UPDATE drugs SET
                             drugName=?, drugNameP=?, drugCategory=?, drugMartindaleCat=?, drugMedicalCat=?, drugTags=?, drugFor=?,
                             drugFDC=?, drugOTC=?, drugOTCDetail=?, drugExtraDetail=?, drugHiddenData=?, drugUse=?, drugUseOffLabel=?, drugSideEff=?, drugConflict=?, drugPregnancy=?, drugDemand=?,
                             drugType=?, drugBrand=?, drugImg=?, updatedAt=NOW()
            WHERE id=?`;
        const vals = [
            drug.drugName,
            drug.drugNameP,
            drug.drugCategory,
            drug.drugMartindaleCat, // New field
            drug.drugMedicalCat,     // New field
            drug.drugTags,
            drug.drugFor,
            toBool(drug.drugFDC), // Use the helper function
            toBool(drug.drugOTC), // Use the helper function
            drug.drugOTCDetail,      // New field
            drug.drugExtraDetail,      // New field
            drug.drugHiddenData,     // New field
            drug.drugUse,
            drug.drugUseOffLabel,
            drug.drugSideEff,
            drug.drugConflict,       // New field
            drug.drugPregnancy,      // New field
            drug.drugDemand,         // New field
            JSON.stringify(drug.drugType), // Assuming drugType is an array of objects
            JSON.stringify(drug.drugBrand), // Assuming drugBrand is an array of objects
            JSON.stringify(drug.drugImg),   // Assuming drugImg is an array of filenames
            id
        ];
        await pool.query(sql, vals);
    },

    softDelete: async (id) => {
        await pool.query(`UPDATE drugs SET isDeleted=1 WHERE id=?`, [id]);
    },

    restore: async (id) => {
        await pool.query(`UPDATE drugs SET isDeleted=0 WHERE id=?`, [id]);
    },

    search: async (query) => {
        const q = `%${query}%`;
        const [rows] = await pool.query(
            `SELECT * FROM drugs WHERE isDeleted=0 AND 
       (drugName LIKE ? OR drugNameP LIKE ? OR drugTags LIKE ?)`, // You might want to add more searchable fields here
            [q, q, q]
        );
        return rows;
    }
};
