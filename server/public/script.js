const uploadForm = () => {
    const form = document.querySelector('#upload-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData();
        const files = document.getElementById('files').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        uploadFiles(formData);
    });

    function uploadFiles(formData) {
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error uploading files');
                }
                console.log('Files uploaded successfully');
            })
            .catch((error) => {
                console.error('Error:', error.message);
            });
    }

};










function setupFileUploader() {
    const form = document.getElementById('upload-form');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('files');

    // Separate drag and drop functionality
    setupDragAndDrop(uploadZone, fileInput, handleFiles);

    // Submit form when files are selected
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        handleFiles(files);
    });

    async function handleFiles(files) {
        // Provide feedback to the user
        // (optional: add loading spinner or progress bar)
        console.log('Uploading files...');
        
        // Send files asynchronously
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Upload successful:', data);
            // (optional: provide success message or update UI)
        } catch (error) {
            console.error('Upload failed:', error);
            // (optional: provide error message or update UI)
        }
    }
}

function setupDragAndDrop(uploadZone, fileInput, handleFiles) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when a file is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    uploadZone.addEventListener('drop', handleDrop, false);

    // Open file picker when upload zone is clicked
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        uploadZone.classList.add('highlight');
    }

    function unhighlight() {
        uploadZone.classList.remove('highlight');
    }

    async function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        await handleFiles(files);
    }
}

setupFileUploader();




const testButtons = () => {
    const optbtn = document.createElement('button');
    optbtn.innerText = 'Optimize';
    optbtn.addEventListener('click', () => {
        fetch('/optimize', { method: 'GET' })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok');
        })
        .then(data => {
            console.log(data);
            console.log('the optimization process is completed');
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });    });
    document.body.appendChild(optbtn);


    const btn = document.createElement('button');
    btn.innerText = 'Refresh Page';
    btn.addEventListener('click', () => {
        location.reload();
    });
    document.body.appendChild(btn);


    const delbtn = document.createElement('button');
    delbtn.innerText = 'Delete All Files';
    delbtn.addEventListener('click', () => {
        fetch('/delete-files', { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Could not delete');
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
    document.body.appendChild(delbtn);


    optbtn.style.background = 'green';
    btn.style.background = 'yellow';
    delbtn.style.background = 'crimson';




    document.querySelector('.download-optimized-zip').addEventListener('click', () => {
        fetch('/create-zip', { method: 'GET' })
        .then(response => {
            if (response.ok) {
                fetch('/download', { method: 'GET' })
                return response.text();
            }
            throw new Error('Could not create zip');
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
}



window.addEventListener('DOMContentLoaded', () => {
    uploadForm();

    
    testButtons();




    const filesList = () => {
        const rowData = [
            ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'],
            ['Data 6', 'Data 7', 'Data 8', 'Data 9', 'Data 10'],
        ];
    
        // Function to generate table rows
        const generateTableRows = () => {
            const tbody = document.querySelector('tbody');
            rowData.forEach(data => {
                const tr = document.createElement('tr');
                data.forEach(item => {
                    const td = document.createElement('td');
                    td.textContent = item;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
    
        generateTableRows();
    };

    // filesList();
});






