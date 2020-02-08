require('dotenv').config()
const core = require('@actions/core');
const { BadgeFactory } = require('gh-badges');
const fs = require('promise-fs');
const parseOpenCover = require('./parse-xml');
const commitAndPush = require('./git-utils');

async function run() {
  try {
    const minimumCoverage = parseInt(core.getInput('minimum-coverage', { required: true }), 10);
    const badgeFilePathInput = core.getInput('path-to-badge', { required: true });
    const openCoverFilePathInput = core.getInput('path-to-opencover-xml', { required: true });

    let coveragePercentage = 0;

    const sequenceCoverage = await parseOpenCover(openCoverFilePathInput);
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
  
    // Create the badge
    const bf = new BadgeFactory();
    const svg = bf.create(format);
    await fs.writeFile(badgeFilePathInput, svg);
  
    // Commit and push the badge
    await commitAndPush(badgeFilePathInput);

    core.info('Action successful');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
