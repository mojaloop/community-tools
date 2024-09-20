# Databases and Queries 

A comprehensive CSV file was generated, containing detailed information about all software components. This file includes data such as component name, type, group, license ID, version, publish details, and the associated repository.

To facilitate easy access and querying, this CSV file was imported into a database(MySQL). This setup allows for efficient querying and analysis of component data, making it straightforward to retrieve specific information and perform various data operations as needed.


![image](https://github.com/user-attachments/assets/b6c5ba9d-f289-4c8b-890a-de7bf3e0b75c)


## **Example Query:** 
Select type, name from sbom_table where license-id='MIT' and repo='central-ledger';
<br> 
This query gives the type(application or library) and name of the components of central-ledger reposiotry having MIT license. 

## Steps : 

1. Find the directory that contains all the sbom-components-csv files.( 

2. `components-to-database.js` script is used to scan all the csv files and generate `components.csv` that contains all components over all Mojaloop repositories.

3. `components-last-publish.sh` adds publish details to `components.csv` which results in a final database csv `components-publish.csv`.

4. Upload `components-publish.csv` to any database and start querying. 