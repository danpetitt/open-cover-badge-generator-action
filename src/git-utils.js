const exec = require('@actions/exec');
const core = require('@actions/core');

const commitAndPush = async function(files) {
  const repoTokenInput = core.getInput('repo-token', { required: true });

  core.info('Committing new badge');
  await exec.exec('git', ['config', 'user.name', `"${process.env['GITHUB_ACTOR']}"`]);
  await exec.exec('git', ['config', 'user.email', `"${process.env['GITHUB_ACTOR']}@users.noreply.github.com"`]);
  await exec.exec('git', ['remote', 'set-url', 'origin', `https://x-access-token:${repoTokenInput}@github.com/${process.env['GITHUB_REPOSITORY']}.git`]);
  for (const file of files) {
    await exec.exec('git', ['add', file]);
  }
  await exec.exec('git', ['commit', '-m', `"Updated code coverage badges [skip ci]"`]);
  await exec.exec('git', ['push']);
  core.info('New coverage badge committed, all done');
}

module.exports = commitAndPush;
