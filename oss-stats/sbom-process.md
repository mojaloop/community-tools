# Summary of SBOM Project for Mojaloop Repositories 

This project aimed to enhance transparency and manageability within the Mojaloop ecosystem by generating and analyzing Software Bill of Materials (SBOMs) for all Mojaloop repositories. A comprehensive CSV file was created that captures dependency data across the entire platform.

The final CSV includes details on each dependency, listing the Mojaloop services that rely on it, along with other details such as license id, versions, types, group names, and last publish details. This consolidated view not only improves visibility and compliance but also streamlines maintenance and dependency management.

## Steps to Generate the final CSV file 
### 1. Clone Repositories 
Clone all the repositories which are required for analysis to the local machine. A list of Mojaloop repositories were selected to be cloned. 

This is done by the program - "clone-repos.sh" 
	
It takes a list of repositories to be cloned and then runs the command "git clone" on clone each of the repositories and saves the output to a specific folder(cloned-repos) containing all repositories.

![image](https://github.com/user-attachments/assets/82c72474-2831-4b63-bb59-f7bf192b9b78)

### 2. Generate SBOMs for all repositories 
Using CycloneDX generator tool generate SBOMs for all the cloned repositories and save it in a folder(sboms)

The following commands are used to install CycloneDX generator and then generate sboms 
- `npm install --global @cyclonedx/cyclonedx-npm`
- `cyclonedx-npm --output-format "XML" --output-file new-sbom.xml`

![image](https://github.com/user-attachments/assets/d2e5685a-6da2-408b-a703-4c1bc90671d4)

### 3. Generate unique dependencies for each repository
The sboms generated contain a field called "dependencies". The dependencies for each repository or sbom is fetched by paring the sbom using DOM parser in javascript. The dependencies are stored as a set in javascript to avoid duplicates and ensure uniqueness. This is done by the program "parse-sboms-dependencies.html".

The bash script "automate-dependencies-csv.sh" is used to automate the process of connecting to server, running the html webpage, downloading and moving the resulting csv file to a desired older, over multiple repositories. 
![image](https://github.com/user-attachments/assets/fbe758c1-b66a-4116-82c8-f6fbabf3c387)

### 4. Generate unique components for each repository
The sboms generated contain a field called "components". The components for each repository or sbom is fetched by paring the sbom using DOM parser in javascript. Only a few fields that is - bom_ref, type, group, name, license_id and version is fetched from the sbom. The components are stored as a set in javascript to avoid duplicates and ensure uniqueness. This is done by the program "parse-sboms-compoenents.html". 

The bash script "automate-components-csv.sh" is used to automate the process of connecting to server, running the html webpage, downloading and moving the resulting csv file to a desired older, over multiple repositories. 
![image](https://github.com/user-attachments/assets/0a99a1dd-f127-42bc-b6de-76f7c853b17c)

### 5. Map dependencies to the services that rely on it 
This is done by the program "map.js". There are a couple of steps involved in this process : 
- Create a data structure to store dependencies and the services/repositories that rely on it 
- This is stored as a map, the key of the map is a string containing the dependency name and the value is an array that holds the services 
![image](https://github.com/user-attachments/assets/1f873a16-dd4e-45c4-9afd-7b3dbf34892d)

- Identify common dependencies across different versions and make a common map to represent a single unique dependency. Version number is identified by the last set of characters in the dependency after the last "@" character in the dependency.
![image](https://github.com/user-attachments/assets/4bb86bca-8f3f-4bc9-b7ec-b0eed8c021ef)

- Convert the following structure to a csv file named "dependency-services.csv" 
![image](https://github.com/user-attachments/assets/19076ad9-5f37-4c5e-af43-28f0ca3f1081)


### 6. Last publish details 
"npm view" command is used to find the last publish details of a dependency. The dependency along with its version number is given as a parameter npm view <package-name>@<version>
	
The last line of the output is gives the last publish day(ex- 3months ago) and the publisher name and email. 
	
This field is added to the dependencies-services csv file to produce "dependencies-services-last-publish.csv" file.
All this is done by the bash script - "dependencies-services-last-publish.sh"

![image](https://github.com/user-attachments/assets/1dedd7f2-4b70-442c-bbb2-bdc497ae4981)


### 7. Merge dependencies to software components 
This is done by the program "sbom-components-to-csv.js". There are a couple of steps involved in this process 
- Reads all the components of every repository and builds a map containing only unique dependencies across all Mojaloop repositories. 
- The key of the map is the dependency and the value of the map is a string containing these comma separated values - type, bom_ref, group, name, version and license_id
![image](https://github.com/user-attachments/assets/5648c2ef-e0e6-43c3-95b6-ad34277da7af)

- The "dependencies-services-last-publish.csv" is scanned line by line such that for every dependency that occurs in map, the fields- type, group, name, license_id are added to the final csv 
- The result is stored in "components-dependencies.csv" file 
![image](https://github.com/user-attachments/assets/1eeb4887-9ec3-4362-ad5f-9ac5ac330f16)


## Final CSV - "components-dependencies.csv"

This final document contains the following fields 

- **Dependency** - A dependency in software development refers to an external code library, package, or module that a software project requires to function.
- **Type** - Type indicates the nature of the dependency in terms of its role or classification within the software project. Different types can be library, framework, plugin, tool, etc. 
- **Group** - Group refers to an organizational grouping for dependencies. This helps to organize and categorize the components more efficiently. 
- **Name** - It is an identifier to denote a specific dependency. 
- **License_id** - It refers to the identifier of the license under which a specific dependency is distributed. This id helps in understanding the legal terms and conditions associated with the use, modification, and distribution of the component. 
- **Version** - It refers to the version of a dependency. This field is critical for precise identification, dependency management like - updates, patches, compatibility and security assessments. 
- **Publish_details** - It refers to the last publish details for each dependency version i.e., time it was published and publisher's name and email. 
- **Services** - List of Mojaloop services sorted alphabetically that depends on a particular dependency and version 
  
Example output - 
![image](https://github.com/user-attachments/assets/96703ff8-0c03-433d-8da7-53884b9a2dbc)












