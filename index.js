require('dotenv').config()
const exec = require('@actions/exec');
const core = require('@actions/core');
const { BadgeFactory } = require('gh-badges');
const parseString = require('xml2js').parseString;
const fs = require('promise-fs');

async function parseXml(filepath) {
  let sequenceCoverage = null;

  const content = await fs.readFile(filepath);
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

async function run() {
  try {
    // Testing paths
    // process.env[`INPUT_${'minimum-coverage'.toUpperCase()}`] = '85';
    // process.env[`INPUT_${'path-to-badge'.toUpperCase()}`] = 'coverage-badge.svg';
    // process.env[`INPUT_${'path-to-opencover-xml'.toUpperCase()}`] = 'coverage.opencover.xml';

    const minimumCoverage = parseInt(core.getInput('minimum-coverage', { required: true }), 10);
    const badgeFilePathInput = core.getInput('path-to-badge', { required: true });
    const openCoverFilePathInput = core.getInput('path-to-opencover-xml', { required: true });
    const repoTokenInput = core.getInput('repo-token', { required: true });

    // core.info(`minimum-coverage: ${minimumCoverage}`);
    // core.info(`path-to-badge: ${badgeFilePathInput}`);
    // core.info(`path-to-opencover-xml: ${openCoverFilePathInput}`);

    let coveragePercentage = 0;

    // Find the open cover xml file
    const sequenceCoverage = await parseXml(openCoverFilePathInput);
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
    await fs.writeFile(badgeFilePathInput, svg);
  
    // Now commit the file
    core.info('Committing new badge');
    await exec.exec('git', ['config', 'user.name', `"${process.env['GITHUB_ACTOR']}"`]);
    await exec.exec('git', ['config', 'user.email', `"${process.env['GITHUB_ACTOR']}@users.noreply.github.com"`]);

   await exec.exec('git', ['remote', 'set-url', 'origin', `https://x-access-token:${repoTokenInput}@github.com/${process.env['GITHUB_REPOSITORY']}.git`]);
    // await exec.exec('git', ['remote', 'set-url', 'origin', `https://${GITHUB_ACTOR}:${repoTokenInput}@github.com/${process.env['GITHUB_REPOSITORY']}.git`]);

    await exec.exec('git', ['add', badgeFilePathInput]);
    await exec.exec('git', ['commit', '-m', `"Code coverage badge [skip ci]"`]);
    await exec.exec('git', ['push']);
    core.info('New coverage badge committed, all done');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
