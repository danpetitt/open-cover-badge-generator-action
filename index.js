const exec = require('@actions/exec');
const core = require('@actions/core');
const github = require("@actions/github");
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

  const minimumCoverage = parseInt(core.getInput('minimum-coverage', { required: true }), 10);
  const badgeFilePathInput = core.getInput('path-to-badge', { required: true }).trim();
  const openCoverFilePathInput = core.getInput('path-to-opencover-xml', { required: true }).trim();
  const repoTokenInput = core.getInput('repo-token', { required: true }).trim();

  // core.info(`minimum-coverage: ${minimumCoverage}`);
  // core.info(`path-to-badge: ${badgeFilePathInput}`);
  // core.info(`path-to-opencover-xml: ${openCoverFilePathInput}`);

  let coveragePercentage = 0;

  // Find the open cover xml file
  if (fs.existsSync(openCoverFilePathInput)) {
    const sequenceCoverage = parseXml(openCoverFilePathInput);
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
    fs.writeFileSync(badgeFilePathInput, svg);

    // Now commit the file
    // const octokit = new github.GitHub(repoTokenInput);    
    // octokit.pulls
    // client.graphql.
    core.info('Committing new badge');
    await exec.exec('git', ['config', '--global user.name', `"${process.env['GITHUB_ACTOR']}"`]);
    await exec.exec('git', ['config', '--global user.email', `"${process.env['GITHUB_ACTOR']}@users.noreply.github.com"`]);
    await exec.exec('git', ['remote', 'set-url', 'origin', `"https://x-access-token:${repoTokenInput}@github.com/${process.env['GITHUB_REPOSITORY']}"`]);
    await exec.exec('git', ['add', `"${badgeFilePathInput}"`]);
    await exec.exec('git', ['commit', '-m', `"Code coverage badge [skip ci]"`]);
    await exec.exec('git', ['push']);
    core.info('New coverage badge committed, all done');

  } else {
    core.setFailed(`Open cover file at '${openCoverFilePathInput}' could not be found`);
  }
} catch (error) {
   core.setFailed(error.message);
}
