import axios from 'axios';
import _ from 'underscore';

import {
  CIRCLE_AUTH_TOKEN,
  CIRCLE_BUILD_BRANCH,
  CIRCLE_OWNER,
  CIRCLE_PROJECT_NAME,
  GITHUB_AUTH_TOKEN,
  GITHUB_OWNER,
  GITHUB_PROJECT_NAMES
} from '../constants';
import GithubFetcher from './github';

export function getProjectData() {
  const buildsPromise = getBuilds(CIRCLE_OWNER, CIRCLE_PROJECT_NAME, CIRCLE_BUILD_BRANCH);
  const reviewersStartingFrom = new Date();
  reviewersStartingFrom.setMonth(reviewersStartingFrom.getMonth() - 3);
  const githubFetcher = new GithubFetcher(GITHUB_OWNER, GITHUB_PROJECT_NAMES, GITHUB_AUTH_TOKEN);

  return axios.all([
    githubFetcher.getOpenPullRequests(),
    buildsPromise,
    githubFetcher.getReviewers(reviewersStartingFrom)
  ]).then(axios.spread((pullRequests, builds, reviewers) => (
    { pullRequests, builds, reviewers }
  )));
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
    const url = `https://circleci.com/api/v1/project/${owner}/${repository}/tree/${branch}?circle-token=${CIRCLE_AUTH_TOKEN}&limit=${limit}&offset=${offset}`;
    return axios.get(url).then((response) => (response.data));
  }

  function oldestBuildReached(builds) {
    if (builds.length === 0) {
      return true;
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
    const buildMonth = getBuildMonth(build);
    if (_.last(memo) && _.last(memo).month === buildMonth) {
      _.last(memo).builds.push(build);
    } else {
      memo.push({month: buildMonth, builds: [build]});
    }
    return memo;
  }, []);

  const successRatesByMonth = [];

  buildsByMonth.forEach((buildGroup, i) => {
    const successRate = {month: buildGroup.month, value: getSuccessRate(buildGroup.builds)};
    if (isNaN(successRate.value) && i > 0) {
      successRate.value = successRatesByMonth[i - 1].value;
    } else if (isNaN(successRate.value)) {
      successRate.value = 0;
    }
    successRatesByMonth.push(successRate);
  });

  return successRatesByMonth;

  function getBuildMonth(build) {
    // Sometimes build.start_time is null
    const buildDate = new Date(build.start_time || build.stop_time);
    const year = buildDate.getFullYear();
    const month = buildDate.getMonth() + 1;
    return `${year}-${month}`;
  }
}
