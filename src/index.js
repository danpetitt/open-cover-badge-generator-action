require('dotenv').config()
const core = require('@actions/core');
const parseOpenCover = require('./parse-xml');
const commitAndPush = require('./git-utils');
const generateBadge = require('./generate-badge');

async function run() {
  try {
    const openCoverFilePathInput = core.getInput('path-to-opencover-xml', { required: true });
    let badgesFilePathInput = core.getInput('path-to-badges', { required: false });
    if (!badgesFilePathInput) {
      badgesFilePathInput = './/';
    }

    const coverageResults = await parseOpenCover(openCoverFilePathInput);
    if (!coverageResults) {
      core.setFailed('No coverage results could be found');
    }

    const lineBadgePath = `${badgesFilePathInput}//coverage-badge-line.svg`.replace(/\/\/\/\//g, '//');
    const wasNewLineBadgeCreated = await generateBadge(
      lineBadgePath,
      'coverage: line',
      coverageResults.lineCoverage
    );

    const branchBadgePath = `${badgesFilePathInput}//coverage-badge-branch.svg`.replace(/\/\/\/\//g, '//');
    const wasNewBranchBadgeCreated = await generateBadge(
      branchBadgePath,
      'coverage: branch',
      coverageResults.branchCoverage
    );

    if (wasNewLineBadgeCreated || wasNewBranchBadgeCreated) {
      // Default for no value is 'true'
      const commitBadges = core.getInput('commit-badges', { required: false });
      if (commitBadges.length === 0 || commitBadges === 'true') {
        await commitAndPush([
          lineBadgePath,
          branchBadgePath
        ]);
      }
    } else {
      core.info('No new badges were created, skipping git commit')
    }

    core.info('Action successful');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
