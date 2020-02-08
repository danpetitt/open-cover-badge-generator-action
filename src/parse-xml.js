const parseString = require('xml2js').parseString;
const fs = require('promise-fs');

const parseOpenCover = async function(filepath) {
  let sequenceCoverage = null;

  const content = await fs.readFile(filepath);
  if (content.length > 0) {
    parseString(content, (err, result) => {
      if (err) {
        throw `Not a valid xml, parsing failed with error: ${err}`;
      } else if (result && result.CoverageSession && result.CoverageSession.Summary) {
        // we have an open cover xml file, retrieve the appropriate property
        sequenceCoverage = result.CoverageSession.Summary[0]['$'].sequenceCoverage;
      }
    });
  }

  return sequenceCoverage;
}

module.exports = parseOpenCover;
