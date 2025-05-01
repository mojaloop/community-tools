# Collecting and Mapping Dependencies 
This aims to enhance transparency and manageability within the Mojaloop ecosystem by generating and analyzing Software Bill of Materials (SBOMs) for all Mojaloop repositories. A comprehensive CSV file was created that captures dependency data across the entire platform.<br>

The final CSV includes details on each dependency, listing the Mojaloop services that rely on it, along with other details such as license id, versions, types, group names, and last publish details. This consolidated view not only improves visibility and compliance but also streamlines maintenance and dependency management.<br>

## **Steps:**

1. **Cloning Repositories:** All the Mojaloop repositories are cloned iteratively and stored at a particular folder cloned-repos. <br>
Done by - `clone-repos.sh`

2. **Generate SBOMs:** SBOMs for all cloned repositories is generated using CycloneDX generator in xml format and stored in a particular location sboms. <br>
Done by - `generate-sboms.sh`

4. **Fetch all dependencies accross all repositories:** All dependencies are stored repo-wise as CSVs in a particular folder sbom-dependencies-csv. This is done using xslt processors, an xslt file is written to fetch dependenceis from each repo's SBOM and saved as a CSVs. <br>
Done by - `automate-dependencies-csv.sh`

5. **Map unique dependencies to Mojaloop repositories:** A javascript program is written that identifies unique dependencies along with their versions and maps them to all the Mojaloop repositories that depend on them. Map datastructure in javascript is used to do this. 
![image](https://github.com/user-attachments/assets/95ddc6ac-3361-44f7-b042-ade506e46374)
Done by - `map.js`

6. **Add deprecated status:** Check if the packages in the generated sboms are active in registry or deprecated and need to be replaced. 
Done by - `deprecated.js`

6. **Add publish details:** Publish details for each dependency and version is added to the CSV, to know the publish time and author of the dependency. this is done using the npm view command. 
![image](https://github.com/user-attachments/assets/2ae4360b-a2ed-487b-8c92-12448ba94687)
Done by - `dependencies-services-last-publish.sh`

7. **Fetch all components accross all repositories:** All components are stored repo-wise as CSVs in a particular folder sbom-components-csv. Components include data like type, name, group, license-id, description etc. This is done using xslt processors, an xslt file is written to fetch components and their related data from each repo's SBOM and saved as a CSVs. <br>
Done by - `automate-components-csv.sh`

8. **Find unique components across all repositories and merge them to the dependencies:** This generates a final CSV that contains all the software components used at Mojaloop, their details like type of component, license-id, name, group, version, publish details, along with all the Mojaloop services/repos that depend on each software component. Dependency name and component name are compared to add components data to the dependency map. 
![image](https://github.com/user-attachments/assets/f9d14202-ce68-490a-9c5a-35a3060100e4)
Done by - `sbom-components-to-csv.js`

To ensure continuous and efficient updates, this process is automated through a cron job that runs on a monthly basis. This setup allows for the automatic generation and updating of SBOMs and dependency mapping, eliminating the need for manual intervention and ensuring that the data remains current.

`cron-job.sh` is run on the 1st of every month to get the latest dependencies, and the final output is saved to `components-dependencies.csv`

## Overall flow 
<img width="1022" alt="image" src="https://github.com/user-attachments/assets/ed27f26d-8a7b-42c1-a3d0-8aece0143317">
