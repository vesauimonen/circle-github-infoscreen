import axios from 'axios';
import _ from 'underscore';

import {CIRCLE_BUILD_BRANCH, CIRCLE_PROJECT_NAME, GITHUB_PROJECT_NAMES, OWNER} from '../constants';


const GITHUB_AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN;
const CIRCLECI_AUTH_TOKEN = process.env.CIRCLECI_AUTH_TOKEN;

export function getProjectData() {
  const pullRequestPromises = GITHUB_PROJECT_NAMES.map(projectName =>
    getPullRequests(OWNER, projectName)
  );

  const allPullRequestPromises = axios.all(pullRequestPromises).then(axios.spread((...args) => {
    const pullRequests = args.reduce((a, b) => a.concat(b));
    return pullRequests.sort((pr1, pr2) => {
      return pr2.created_at > pr1.created_at ? 1 : ((pr1.created_at > pr2.created_at) ? -1 : 0);
    });
  }));

  const buildsPromise = getBuilds(OWNER, CIRCLE_PROJECT_NAME, CIRCLE_BUILD_BRANCH);
  return axios.all([allPullRequestPromises, buildsPromise])
    .then(axios.spread((pullRequests, builds) => {
      return {
        pullRequests: pullRequests.reverse(),
        builds: builds
      };
    })
  );
}

export function getPullRequests(owner, repository) {
  const url = (
    `https://api.github.com/repos/${owner}/${repository}/pulls?access_token=${GITHUB_AUTH_TOKEN}`
  );
  return axios.get(url).then((response) => (response.data));
}


export function getBuilds(owner, repository, branch) {
  const startingFrom = new Date('2015-04-01');

  return getBuildsRecursively([], 100, 0);

  function getBuildsRecursively(builds, limit, offset) {
    return getBuildsFromCircle(limit, offset).then((newBuilds) => {
      builds = builds.concat(newBuilds);
      if (!oldestBuildReached(builds) && newBuilds.length === limit) {
        return getBuildsRecursively(builds, limit, offset + limit);
      }
      return builds;
    });
  }

  function getBuildsFromCircle(limit, offset) {
    const url = `https://circleci.com/api/v1/project/${owner}/${repository}/tree/${branch}?circle-token=${CIRCLECI_AUTH_TOKEN}&limit=${limit}&offset=${offset}`;
    return axios.get(url).then((response) => (response.data));
  }

  function oldestBuildReached(builds) {
    if (builds.length === 0) {
      return false;
    }
    const oldestBuildStartTime = new Date(builds[builds.length - 1].start_time);
    return oldestBuildStartTime < startingFrom;
  }
}

export function getSuccessRate(builds) {
  const totalSuccessfulBuilds = builds.filter((b) => b.outcome === 'success').length;
  const totalFailedBuilds = builds.filter((b) => b.outcome === 'failed').length;
  return Math.floor((totalSuccessfulBuilds / (totalSuccessfulBuilds + totalFailedBuilds)) * 100);
}

export function getSuccessRatesByMonth(builds) {
  const buildsByMonth = builds.reduce((memo, build) => {
    const startMonth = getBuildStartMonth(build);
    if (_.last(memo) && _.last(memo).month === startMonth) {
      _.last(memo).builds.push(build);
    } else {
      memo.push({month: startMonth, builds: [build]});
    }
    return memo;
  }, []);

  return buildsByMonth.map((buildGroup) => {
    return {month: buildGroup.month, value: getSuccessRate(buildGroup.builds)};
  });

  function getBuildStartMonth(build) {
    const startDate = new Date(build.start_time);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    return `${year}-${month}`;
  }
}
