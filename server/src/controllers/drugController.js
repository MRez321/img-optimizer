// ../controllers/drugController.js
const { v4: uuidv4 } = require('uuid');
const drugModel = require('../models/drugModel');

// Helper to extract dynamic grouped fields like drugType, drugExtra, drugDose
// It groups fields based on a common index (e.g., drugType_1, drugExtra_1, drugDose_1)
function extractGroupedDrugFields(body) {
    const groupedFields = [];
    const fieldsToGroup = ['drugType', 'drugExtra', 'drugDose'];
    let maxIndex = -1; // Start with -1 to correctly handle index 0

    // Find the highest index present in the body for any of the fields to group
    Object.keys(body).forEach(key => {
        fieldsToGroup.forEach(prefix => {
            if (key.startsWith(prefix + '_')) {
                const indexStr = key.substring(prefix.length + 1);
                const currentIndex = parseInt(indexStr, 10);
                if (!isNaN(currentIndex) && currentIndex > maxIndex) {
                    maxIndex = currentIndex;
                }
            }
        });
    });

    // Also check for the base fields (index 0) if they exist, and update maxIndex if needed
    if (body.drugType !== undefined || body.drugExtra !== undefined || body.drugDose !== undefined) {
        maxIndex = Math.max(maxIndex, 0);
    }

    // If no indexed fields or base fields were found, return empty
    if (maxIndex === -1) {
        return [];
    }

    // Iterate from index 0 up to maxIndex to build the objects
    for (let i = 0; i <= maxIndex; i++) {
        const typeKey = i === 0 ? 'drugType' : `drugType_${i}`;
        const extraKey = i === 0 ? 'drugExtra' : `drugExtra_${i}`;
        const doseKey = i === 0 ? 'drugDose' : `drugDose_${i}`;

        const drugTypeVal = body[typeKey];
        const drugExtraVal = body[extraKey];
        const drugDoseVal = body[doseKey];

        // Only add an object if at least one of the fields for this index has a value
        // This prevents empty objects in the array if only one field existed for an index
        if (drugTypeVal !== undefined || drugExtraVal !== undefined || drugDoseVal !== undefined) {
            groupedFields.push({
                drugType: drugTypeVal !== undefined ? drugTypeVal : null, // Use null if undefined
                drugExtra: drugExtraVal !== undefined ? drugExtraVal : null,
                drugDose: drugDoseVal !== undefined ? drugDoseVal : null
            });
        }
    }

    return groupedFields;
}

// Original helper for drugBrandName, assuming it remains an array of strings
function extractDynamicSet(body, prefix) {
    const keys = Object.keys(body).filter(k => k.startsWith(prefix));
    let grouped = [];
    keys.forEach(k => grouped.push(body[k]));
    if (body[prefix]) grouped.unshift(body[prefix]);
    return grouped;
}

// Helper to extract dynamic set of values, like brand names
// function extractDynamicSet(body, prefix) {
//     const values = [];
//     let index = 0;
//     // Check for indexed fields first
//     while (body[`${prefix}_${index}`] !== undefined) {
//         values.push(body[`${prefix}_${index}`]);
//         index++;
//     }
//     // Check for the base field (index 0) if it exists and wasn't picked up by the loop
//     if (values.length === 0 && body[prefix] !== undefined) {
//         values.push(body[prefix]);
//     } else if (index === 0 && body[prefix] !== undefined) {
//         // If there was an index 0 field and also a base field, decide how to handle.
//         // For simplicity, let's assume if indexed fields exist, they take precedence.
//         // If only a base field exists, it's added. If both, the indexed ones are already added.
//         // This logic might need adjustment based on exact frontend naming.
//         // For now, we assume if indexed fields exist, the base field might be redundant or handled differently.
//         // Let's refine: if index > 0, we've already captured indexed fields. If index == 0 and base exists, push it.
//         if (index === 0 && body[prefix] !== undefined) {
//             // This case is tricky. Let's assume the indexed fields are primary.
//             // If ONLY base field exists, it will be captured.
//             // If base AND indexed exist, the indexed are captured by the loop.
//             // This might need adjustment based on how frontend sends data when both exist.
//             // A common pattern is that `fieldName` is for the first item and `fieldName_1`, `fieldName_2` etc. are subsequent.
//             // Let's ensure `fieldName` is added IF no indexed fields were found and `fieldName` exists.
//             if (values.length === 0 && body[prefix] !== undefined) {
//                 values.push(body[prefix]);
//             }
//         }
//     }
//     // Simpler approach for brands: assume `drugBrandName` is the first, then `drugBrandName_1`, etc.
//     const brandValues = [];
//     let brandIndex = 0;
//     while(body[`${prefix}_${brandIndex}`] !== undefined) {
//         brandValues.push(body[`${prefix}_${brandIndex}`]);
//         brandIndex++;
//     }
//     // If no indexed brands, check for the single 'drugBrandName' field
//     if (brandValues.length === 0 && body[prefix] !== undefined) {
//         brandValues.push(body[prefix]);
//     }
//     return brandValues;
// }


exports.getAllDrugs = async (req, res) => {
    try {
        const includeDeleted = req.query.deleted === 'true';
        const data = await drugModel.getAll(includeDeleted);
        res.json(data);
    } catch (error) {
        console.error("Error in getAllDrugs:", error);
        res.status(500).json({ message: 'Failed to retrieve drugs', error: error.message });
    }
};

exports.getDrug = async (req, res) => {
    try {
        const data = await drugModel.getById(req.params.id);
        if (!data) {
            return res.status(404).json({ message: 'Drug not found' });
        }
        res.json(data);
    } catch (error) {
        console.error(`Error in getDrug (ID: ${req.params.id}):`, error);
        res.status(500).json({ message: 'Failed to retrieve drug', error: error.message });
    }
};

exports.createDrug = async (req, res) => {
    const id = uuidv4();
    const { body, files } = req;

    // Process images: ensure they are an array, even if only one or none uploaded
    const images = files ? (Array.isArray(files) ? files : [files]).map((f) => `/uploads/${f.filename}`) : [];

    // Extract all potentially dynamic fields
    const drugData = {
        id,
        drugName: body.drugName,
        drugNameP: body.drugNameP,
        drugCategory: body.drugCategory,
        drugMartindaleCat: body.drugMartindaleCat, // Added
        drugMedicalCat: body.drugMedicalCat,       // Added
        drugTags: body.drugTags,
        drugFor: body.drugFor,
        drugUse: body.drugUse,
        drugUseOffLabel: body.drugUseOffLabel,
        drugSideEff: body.drugSideEff,
        drugConflict: body.drugConflict,           // Added
        drugPregnancy: body.drugPregnancy,         // Added
        drugDemand: body.drugDemand,               // Added
        drugFDC: body.drugFDC === 'true',          // Explicitly check for 'true' string
        drugOTC: body.drugOTC === 'true',          // Explicitly check for 'true' string
        drugOTCDetail: body.drugOTCDetail,         // Added
        drugExtraDetail: body.drugExtraDetail,         // Added
        drugHiddenData: body.drugHiddenData,       // Added

        // Use helpers for dynamic fields
        drugType: extractGroupedDrugFields(body),
        drugBrand: extractDynamicSet(body, 'drugBrandName'), // Assumes brands are like drugBrandName, drugBrandName_1 etc.
        drugImg: images
    };

    try {
        await drugModel.create(drugData);
        res.status(201).json({ message: 'Drug created successfully', id: id });
    } catch (error) {
        console.error("Error in createDrug:", error);
        res.status(500).json({ message: 'Failed to create drug', error: error.message });
    }
};

exports.updateDrug = async (req, res) => {
    const { id } = req.params;
    const { body, files } = req;

    // Fetch the existing drug to potentially merge image data or handle deletions
    const existingDrug = await drugModel.getById(id);
    if (!existingDrug) {
        return res.status(404).json({ message: 'Drug not found' });
    }

    // Process new images
    const newImages = files ? (Array.isArray(files) ? files : [files]).map((f) => `/uploads/${f.filename}`) : [];

    // Combine existing images with new ones, and handle potential image deletion requests (if frontend sends them)
    // For simplicity here, we'll assume new images replace old ones, or you'll implement a separate DELETE endpoint for images.
    // If you want to ADD images to existing ones:
    const allImages = [...existingDrug.drugImg, ...newImages];
    // If you want new images to REPLACE existing ones:
    // const allImages = newImages;

    // Construct the drug object with updated data
    const drugData = {
        drugName: body.drugName,
        drugNameP: body.drugNameP,
        drugCategory: body.drugCategory,
        drugMartindaleCat: body.drugMartindaleCat, // Added
        drugMedicalCat: body.drugMedicalCat,       // Added
        drugTags: body.drugTags,
        drugFor: body.drugFor,
        drugUse: body.drugUse,
        drugUseOffLabel: body.drugUseOffLabel,
        drugSideEff: body.drugSideEff,
        drugConflict: body.drugConflict,           // Added
        drugPregnancy: body.drugPregnancy,         // Added
        drugDemand: body.drugDemand,               // Added
        drugFDC: body.drugFDC === 'true',          // Explicitly check for 'true' string
        drugOTC: body.drugOTC === 'true',          // Explicitly check for 'true' string
        drugOTCDetail: body.drugOTCDetail,         // Added
        drugExtraDetail: body.drugExtraDetail,         // Added
        drugHiddenData: body.drugHiddenData,       // Added

        // Use helpers for dynamic fields
        drugType: extractGroupedDrugFields(body),
        drugBrand: extractDynamicSet(body, 'drugBrandName'),
        drugImg: allImages // Use combined images
    };

    try {
        await drugModel.update(id, drugData);
        res.json({ message: 'Drug updated successfully' });
    } catch (error) {
        console.error(`Error in updateDrug (ID: ${id}):`, error);
        res.status(500).json({ message: 'Failed to update drug', error: error.message });
    }
};

exports.deleteDrug = async (req, res) => {
    try {
        await drugModel.softDelete(req.params.id);
        res.json({ message: 'Drug soft-deleted successfully' });
    } catch (error) {
        console.error(`Error in deleteDrug (ID: ${req.params.id}):`, error);
        res.status(500).json({ message: 'Failed to delete drug', error: error.message });
    }
};

exports.restoreDrug = async (req, res) => {
    try {
        await drugModel.restore(req.params.id);
        res.json({ message: 'Drug restored successfully' });
    } catch (error) {
        console.error(`Error in restoreDrug (ID: ${req.params.id}):`, error);
        res.status(500).json({ message: 'Failed to restore drug', error: error.message });
    }
};

exports.searchDrugs = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const results = await drugModel.search(query);
        res.json(results);
    } catch (error) {
        console.error("Error in searchDrugs:", error);
        res.status(500).json({ message: 'Failed to search drugs', error: error.message });
    }
};
