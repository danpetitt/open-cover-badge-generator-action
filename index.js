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
  let coverage = 0;

  // Find the open cover xml file
  const files = fs.readdirSync(`${__dirname}`);
  for (const file of files) {
    if (file.indexOf('.xml') !== -1) {
      const sequenceCoverage = parseXml(`${__dirname}\\${file}`);
      if (sequenceCoverage) {
        coverage = Math.round(parseInt(sequenceCoverage, 10));
        break;
      }
    }
  }

  let color = 'green';
  if (coverage < 50) {
    color = 'red';
  }

  const format = {
    text: ['coverage', `${coverage}%`],
    color: color,
    template: 'flat',
  };

  const bf = new BadgeFactory();
  const svg = bf.create(format);
  fs.writeFileSync("coverage-badge.svg", svg);
} catch (error) {
   core.setFailed(error.message);
}
