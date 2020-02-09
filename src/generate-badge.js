const core = require('@actions/core');
const { BadgeFactory } = require('gh-badges');
const fs = require('promise-fs');

const generateBadge = async function(badgeFilePath, labelName, coveragePercentage) {
  const minimumCoverage = parseInt(core.getInput('minimum-coverage', { required: true }), 10);

  let color = 'green';
  if (coveragePercentage < minimumCoverage) {
    color = 'red';
  }

  const format = {
    text: [labelName, `${coveragePercentage}%`],
    color: color,
    template: 'flat',
  };

  // Create the badge
  let existingBadge = '';
  if (fs.existsSync(badgeFilePath)) {
    existingBadge = (await fs.readFile(badgeFilePath)).toString();
  }

  const bf = new BadgeFactory();
  await fs.writeFile(badgeFilePath, bf.create(format));

  const generatingBadge = (await fs.readFile(badgeFilePath)).toString();
  return generatingBadge !== existingBadge;
}

module.exports = generateBadge;
