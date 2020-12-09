import fs from 'fs'
import util from 'util'
import Excel from 'exceljs'

const readdir = util.promisify(fs.readdir);


export type AnchoreSummaryConfigType = {
  // Full path of the anchore reports. For now only a local path
  // TODO: handle s3 bucket location
  pathToAnchoreReports: string,
  outputPath: string,

  // TODO: unimplemented, implement
  shouldUploadSummary?: boolean,
  uploadSummaryS3Path?: string,
}

type VulnSummary = {
  critical: number,
  high: number,
  medium: number,
  low: number,
  [index: string]: number,
}

type VulnRow = {
  vuln: string,
  package: string,
  link: string,
  severity: string,
}

type VulnPage = {
  imageName: string,
  vulnerabilities: Array<VulnRow>
}

const sortIndex = (severity: string): number => {
  switch(severity.toLowerCase()) {
    case 'critical': return 0
    case 'high': return 1
    case 'medium': return 2
    case 'low': return 3
    default: return 3
  }
}

function getFileSummary(vulnFilePath: string): VulnSummary {
  const vulnFile = require(vulnFilePath)
  const vulnerabilities = vulnFile.vulnerabilities.map((vuln: any) => vuln.severity)
  
  const summary = vulnerabilities.reduce((acc: VulnSummary, curr: string) => {
    const lastCount = acc[curr.toLowerCase()];
    acc[curr.toLowerCase()] = lastCount + 1

    return acc;
  }, {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  })

  return summary
}

/**
 * @function getVulnPage
 * @description Gets the vulnerability page for a given file and imageName
 * @param vulnFilePath 
 * @param imageName 
 */
function getVulnPage(vulnFilePath: string, imageName: string): VulnPage {
  const vulnFile = require(vulnFilePath)
  const page: VulnPage = {
    imageName,
    vulnerabilities: []
  }

  vulnFile.vulnerabilities.forEach((rawVuln: any) => {
    const vulnRow = {
      vuln: rawVuln.vuln,
      package: rawVuln.package,
      link: rawVuln.url,
      severity: rawVuln.severity
    }
    page.vulnerabilities.push(vulnRow)
  })
  page.vulnerabilities.sort((a, b) => sortIndex(a.severity) - sortIndex(b.severity))

  return page;
}

async function run(config: AnchoreSummaryConfigType) {

  // Get all *vuln*.json files
  // TODO: handle s3 path
  const allFiles = await readdir(config.pathToAnchoreReports)
  const vulnFiles = allFiles.filter(filename => filename.match('.*vuln.*\.json'))
  const dockerImages = vulnFiles.map(filename => filename.split('_')[0])
  console.log('Summarizing vulnerabilities for images:', dockerImages)

  const workbook = new Excel.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');

  // Default options 
  summarySheet.views = [
    {
      zoomScale: 150,
    }
  ]

  // Add initial columns
  const initialColumns = [
    { header: '', key: 'vuln', width: 10 },
  ];
  dockerImages.forEach(imageName => {
    initialColumns.push({ header: imageName, key: imageName, width: 18 })
  })
  summarySheet.columns = initialColumns

  // Add initial Rows
  summarySheet.addRow({vuln: 'Critical'})
  summarySheet.addRow({vuln: 'High'})
  summarySheet.addRow({vuln: 'Medium'})
  summarySheet.addRow({vuln: 'Low'})

  const criticalRow = summarySheet.getRow(2);
  const highRow = summarySheet.getRow(3);
  const mediumRow = summarySheet.getRow(4);
  const lowRow = summarySheet.getRow(5);

  // Add vulnerability counts
  vulnFiles.forEach((file, idx) => {
    const dockerImage = dockerImages[idx]
    const vulns = getFileSummary(`${config.pathToAnchoreReports}/${file}`)

    criticalRow.getCell(dockerImage).value = vulns.critical
    highRow.getCell(dockerImage).value = vulns.high
    mediumRow.getCell(dockerImage).value = vulns.medium
    lowRow.getCell(dockerImage).value = vulns.low
  })

  // Add conditional formatting for critical and high
  // @ts-ignore
  // `addConditionalFormatting()` not in types
  summarySheet.addConditionalFormatting({
    ref: 'B2:AA2',
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['0'],
        style: { 
          fill: { 
            type: 'pattern', 
            pattern: 'solid', 
            bgColor: { 
              argb: 'FEC7CE' 
            } 
          } 
        },
      }
    ]
  })
  // @ts-ignore
  // `addConditionalFormatting()` not in types
  summarySheet.addConditionalFormatting({
    ref: 'B3:AA3',
    rules: [
      {
        type: 'cellIs',
        operator: 'greaterThan',
        formulae: ['0'],
        style: { 
          fill: { 
            type: 'pattern', 
            pattern: 'solid', 
            bgColor: { 
              argb: 'FFEB9C' 
            } 
          } 
        },
      }
    ]
  })

  // Add new sheet for each dockerImage
  vulnFiles.forEach((file, idx) => {
    const dockerImage = dockerImages[idx]
    const vulnPage = getVulnPage(`${config.pathToAnchoreReports}/${file}`, dockerImage)

    const imageSheet = workbook.addWorksheet(dockerImage)
    imageSheet.views = [
      {
        zoomScale: 150,
      }
    ]
    imageSheet.columns = [
      { header: 'Vulnerability', key: 'Vulnerability', width: 15 },
      { header: 'Package', key: 'Package', width: 21 },
      { header: 'Link', key: 'Link', width: 60 },
      { header: 'Severity', key: 'Severity', width: 12 },
    ]

    vulnPage.vulnerabilities.forEach(vuln => {
      imageSheet.addRow([vuln.vuln, vuln.package, vuln.link, vuln.severity])
    })
  })

  await workbook.xlsx.writeFile(config.outputPath)
  console.log('Finished saving:', config.outputPath)
}

export default {
  run
}