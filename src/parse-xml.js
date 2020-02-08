const Parser = require('xml2js-parser');
const fs = require('promise-fs');

const parseOpenCover = async function(filepath) {
  const content = await fs.readFile(filepath);
  if (content.length > 0) {
    const parser = new Parser({});
    const result = await parser.parseString(content);
    if (result && result.CoverageSession && result.CoverageSession.Summary) {
      // we have an open cover xml file, retrieve the appropriate properties
      const lineCoverage = result.CoverageSession.Summary[0]['$'].sequenceCoverage;
      const branchCoverage = result.CoverageSession.Summary[0]['$'].branchCoverage;
      return { lineCoverage, branchCoverage };
    }
  }

  return null;
}

module.exports = parseOpenCover;
