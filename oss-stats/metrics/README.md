# Publishing Monthly Metrics 

## 1. **Publishing metrics** - 
The collected metrics are aggregated and saved into CSV files. This process ensures that the data is readily available for analysis and reporting. The filenames of these CSV files include the month and year of the report for easy reference and tracking.

## 2. **Cron Job Automation** - 
A cron job was set up to automate the execution of these tasks on a monthly basis. This job ensures that the metrics are collected, saved, and published automatically without manual intervention. The cron job script includes:
- Running the Gulp commands to fetch and summarize data.
- Exporting the results into CSV files.
- Publishing the CSV files to a designated location for access.


## Prerequisites 
- Github API token 
- gulp 
- make 
- typescript 

## Steps: 

1. Clone Mojaloop core repos into a folder. 
This is done by the script `clone-repos.sh`

2. `gulp commits` command is run and the ouput is saved to a temporary file.

3. `commits-convert.js` converts the output of the command to the desired csv format and saves it to a file named with the current month and year number. 

4. `gulp dependencies` command is run and the ouput is saved to a temporary file 

5. `dependencies-convert.js` converts the output of the command to the desired csv format and appends it to the file named with the current month and year number. 

6. `gulp contributors` command is run and the ouput is saved to a temporary file 

7. `contributors-convert.js` converts the output of the command to the desired csv format and appends it to the file named with the current month and year number. 

8. `gulp lines` command is run and the ouput is saved to a temporary file 

9. `lines-convert.js` converts the output of the command to the desired csv format and append it to the file named with the current month and year number. 

10. `gulp get-repo-csv` command is run and the output is saved by default to a new file with the filename as repo month number and year number. 


All these steps are automated by the script `metrics.sh`. <br>
A cron job is set to generate these metrics on the 28th of every month. 