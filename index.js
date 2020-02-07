const core = require('@actions/core');
const { BadgeFactory } = require('gh-badges');
const fs = require('fs');
const parseString = require('xml2js').parseString;

function parseXml(filepath) {
  let sequenceCoverage = null;

  const content = fs.readFileSync(filepath);
  if (content.length > 0) {
    parseString(content, (err, result) => {
      if (err) {
        throw `Not a valid xml, parsing failed with error: ${err}`;
      } else if (result && result.CoverageSession && result.CoverageSession.Summary) {
        // we have an open cover xml file
        sequenceCoverage = result.CoverageSession.Summary[0]['$'].sequenceCoverage;
      }
    });
  }

  return sequenceCoverage;
}

try {
  // Testing paths
  // process.env[`INPUT_${'minimum-coverage'.toUpperCase()}`] = '85';
  // process.env[`INPUT_${'path-to-badge'.toUpperCase()}`] = 'coverage-badge.svg';
  // process.env[`INPUT_${'path-to-opencover-xml'.toUpperCase()}`] = 'coverage.opencover.xml';

  const projectPath = process.env['GITHUB_WORKSPACE'];
  core.info(`Current folder: ${process.cwd()}`);
  core.info(`Project path: ${projectPath}`);
  process.chdir(projectPath);
  core.info(`Current folder: ${process.cwd()}`);

  const minimumCoverage = parseInt(core.getInput('minimum-coverage', { required: true }), 10);
  const badgeFilePathInput = core.getInput('path-to-badge', { required: true }).trim();
  const openCoverFilePathInput = core.getInput('path-to-opencover-xml', { required: true }).trim();

  core.info(`minimum-coverage: ${minimumCoverage}`);
  core.info(`path-to-badge: ${badgeFilePathInput}`);
  core.info(`path-to-opencover-xml: ${openCoverFilePathInput}`);

  const badgeFilePath = `/${badgeFilePathInput}`;  //`~${projectPath}${badgeFilePathInput}`;
  const openCoverFilePath = `/${openCoverFilePathInput}`;  //`~${projectPath}${openCoverFilePathInput}`;

  core.info(`badgeFilePath: ${badgeFilePath}`);
  core.info(`openCoverFilePath: ${openCoverFilePath}`);

  let coveragePercentage = 0;

  // Find the open cover xml file
  if (fs.existsSync(openCoverFilePath)) {
    const sequenceCoverage = parseXml(openCoverFilePath);
    if (sequenceCoverage) {
      coveragePercentage = Math.round(parseInt(sequenceCoverage, 10));
    }

    let color = 'green';
    if (coveragePercentage < minimumCoverage) {
      color = 'red';
    }
  
    const format = {
      text: ['coverage', `${coveragePercentage}%`],
      color: color,
      template: 'flat',
    };
  
    const bf = new BadgeFactory();
    const svg = bf.create(format);
    fs.writeFileSync(badgeFilePath, svg);  
  } else {
    core.setFailed(`Open cover file at '${openCoverFilePath}' could not be found`);
  }
} catch (error) {
   core.setFailed(error.message);
}
