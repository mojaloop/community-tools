const fs = require('fs');
const csv = require('csv-parser');

function csvToHtml(csvFile, htmlFile) {
    const results = [];
    
    fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const allHeaders = Object.keys(results[0]);
            let headers = allHeaders.filter(header => header !== 'description');
            if (allHeaders.includes('description')) {
                headers.push('description');
            }

            let htmlContent = '<html>\n';
            htmlContent += `<head>\n<style>
                                /* CSS styles for the table */
                                h1 {
                                    font-family: Arial, sans-serif;
                                    background-color: #f0f4f8;
                                    color: #0073e6;
                                    margin: 0;
                                    padding: 0;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                }

                                .table-container {
                                    overflow-x: auto; /* Enable horizontal scrolling if needed */
                                }

                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    font-size: 14px; /* Adjust font size */
                                    min-width: 600px; /* Ensure table is wide enough */
                                }

                                table, th, td {
                                    border: 1px solid #ddd;
                                    padding: 6px; /* Reduce padding */
                                    text-align: left;
                                }

                                th {
                                    background-color: #004080; /* Navy blue background for header */
                                    color: #fff; /* White text for header */
                                    position: -webkit-sticky; /* For Safari */
                                    position: sticky;
                                    top: 0; /* Stick the header to the top */
                                    z-index: 1; /* Ensure the header stays above other content */
                                }

                                td {
                                    white-space: nowrap; /* Prevent wrapping by default */
                                }

                                td.name {
                                    white-space: normal; /* Allow wrapping for 'Name' field */
                                    max-width: 150px; /* Limit maximum width */
                                }

                                tr:nth-child(even) {
                                    background-color: #f9f9f9;
                                }

                                tr:hover {
                                    background-color: #e6f2ff; /* Light blue on hover */
                                }

                                caption {
                                    font-size: 16px;
                                    font-weight: bold;
                                    margin-bottom: 10px;
                                }

                            </style>\n</head>\n`;
            let htmlFileName = htmlFile.split('.');
            htmlContent += `<h1>SBOM ${htmlFileName[0]}</h1>\n`;
            htmlContent += '<div class="table-container">\n';
            htmlContent += '<table border="1">\n';
            htmlContent += '  <thead>\n    <tr>\n';
            
            headers.forEach(header => {
                htmlContent += `      <th>${header}</th>\n`;
            });
            
            htmlContent += '    </tr>\n  </thead>\n  <tbody>\n';
            
            results.forEach(row => {
                htmlContent += '    <tr>\n';
                headers.forEach(header => {
                    htmlContent += `      <td>${row[header] || ''}</td>\n`;
                });
                htmlContent += '    </tr>\n';
            });
            
            htmlContent += '  </tbody>\n</table>\n</div>\n</html>\n';
            
            fs.writeFile(htmlFile, htmlContent, (err) => {
                if (err) throw err;
                console.log(`HTML table has been saved to ${htmlFile}`);
            });
        });
}

// Example usage
//csvToHtml('metadata-last-publish.csv', 'metadata-detailed.html');
//csvToHtml('components-last-publish.csv', 'components-detailed.html');
//csvToHtml('dependencies-last-publish.csv', 'dependencies.html');
