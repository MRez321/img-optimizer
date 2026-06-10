// ../models/drugModel.js
const pool = require('../config/db'); // Assuming you have a db.js config for your pool

// Function to parse JSON fields safely
const parseJsonField = (field) => {
    if (!field) return [];
    try {
        // Ensure it's parsed as an array, defaulting to empty array if not
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error parsing JSON field:", field, e);
        return []; // Return empty array on error
    }
};

module.exports = {
    getAll: async (includeDeleted = false) => {
        let query = `SELECT * FROM drugs`;
        if (!includeDeleted) {
            query += ` WHERE isDeleted = 0`;
        }
        query += ` ORDER BY createdAt DESC`; // Optional: order by creation date
        const [rows] = await pool.query(query);
        // Parse JSON fields for consistency, though not strictly needed for getAll if only displaying basic info
        return rows.map(row => ({
            ...row,
            drugType: parseJsonField(row.drugType),
            drugBrand: parseJsonField(row.drugBrand),
            drugImg: parseJsonField(row.drugImg)
        }));
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM drugs WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return null;
        }
        const drug = rows[0];
        // Parse JSON fields when fetching a single drug for editing
        return {
            ...drug,
            drugType: parseJsonField(drug.drugType),
            drugBrand: parseJsonField(drug.drugBrand),
            drugImg: parseJsonField(drug.drugImg),
            // Parse booleans correctly
            drugFBC: drug.drugFBC === 1,
            drugOTC: drug.drugOTC === 1
        };
    },

    create: async (drug) => {
        // Ensure dynamic fields are strings before saving
        const drugTypeString = JSON.stringify(drug.drugType || []);
        const drugBrandString = JSON.stringify(drug.drugBrand || []);
        const drugImgString = JSON.stringify(drug.drugImg || []);

        const query = `
            INSERT INTO drugs (id, drugName, drugNameP, drugCategory, drugMartindaleCat, drugMedicalCat, drugTags, drugFor, drugUse, drugSideEff, drugConflict, drugPregnancy, drugDemand, drugFBC, drugOTC, drugOTCDetail, drugHiddenData, drugType, drugBrand, drugImg, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const values = [
            drug.id, drug.drugName, drug.drugNameP, drug.drugCategory, drug.drugMartindaleCat,
            drug.drugMedicalCat, drug.drugTags, drug.drugFor, drug.drugUse, drug.drugSideEff,
            drug.drugConflict, drug.drugPregnancy, drug.drugDemand,
            drug.drugFBC ? 1 : 0, // Convert boolean to int (1 for true, 0 for false)
            drug.drugOTC ? 1 : 0, // Convert boolean to int
            drug.drugOTCDetail, drug.drugHiddenData,
            drugTypeString, drugBrandString, drugImgString
        ];

        await pool.query(query, values);
        // No need to return data here, controller handles response
    },

    update: async (id, drug) => {
        // Ensure dynamic fields are strings before saving
        const drugTypeString = JSON.stringify(drug.drugType || []);
        const drugBrandString = JSON.stringify(drug.drugBrand || []);
        const drugImgString = JSON.stringify(drug.drugImg || []);

        const query = `
            UPDATE drugs
            SET
                drugName = ?, drugNameP = ?, drugCategory = ?, drugMartindaleCat = ?, drugMedicalCat = ?,
                drugTags = ?, drugFor = ?, drugUse = ?, drugSideEff = ?, drugConflict = ?,
                drugPregnancy = ?, drugDemand = ?,
                drugFBC = ?, drugOTC = ?, drugOTCDetail = ?, drugHiddenData = ?,
                drugType = ?, drugBrand = ?, drugImg = ?,
                updatedAt = NOW()
            WHERE id = ?
        `;
        const values = [
            drug.drugName, drug.drugNameP, drug.drugCategory, drug.drugMartindaleCat, drug.drugMedicalCat,
            drug.drugTags, drug.drugFor, drug.drugUse, drug.drugSideEff, drug.drugConflict,
            drug.drugPregnancy, drug.drugDemand,
            drug.drugFBC ? 1 : 0, drug.drugOTC ? 1 : 0, drug.drugOTCDetail, drug.drugHiddenData,
            drugTypeString, drugBrandString, drugImgString,
            id // WHERE clause
        ];

        await pool.query(query, values);
    },

    softDelete: async (id) => {
        await pool.query(`UPDATE drugs SET isDeleted = 1, deletedAt = NOW() WHERE id = ?`, [id]);
    },

    restore: async (id) => {
        await pool.query(`UPDATE drugs SET isDeleted = 0, deletedAt = NULL WHERE id = ?`, [id]);
    },

    search: async (query) => {
        // Basic search for drugName, drugNameP, and drugTags
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            `SELECT id, drugName, drugNameP FROM drugs WHERE drugName LIKE ? OR drugNameP LIKE ? OR drugTags LIKE ? AND isDeleted = 0`,
            [searchTerm, searchTerm, searchTerm]
        );
        return rows;
    },

    // Optional: Method to delete images from disk if needed, though usually handled by file upload middleware
    // deleteImage: async (filename) => { ... }
};
