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

export function getProjectData() {
  const pullRequestPromises = GITHUB_PROJECT_NAMES.map(projectName =>
    getOpenPullRequests(projectName)
  );

  const allPullRequestPromises = axios.all(pullRequestPromises).then(axios.spread((...args) => {
    const pullRequests = args.reduce((a, b) => a.concat(b));
    return pullRequests.sort((pr1, pr2) => {
      return pr2.created_at > pr1.created_at ? 1 : ((pr1.created_at > pr2.created_at) ? -1 : 0);
    });
  }));

  const buildsPromise = getBuilds(CIRCLE_OWNER, CIRCLE_PROJECT_NAME, CIRCLE_BUILD_BRANCH);

  const reviewerPromises = GITHUB_PROJECT_NAMES.map(projectName => getReviewers(projectName));

  const allReviewerPromises = axios.all(reviewerPromises).then(axios.spread((...args) => {
    const reviewers = args.reduce((a, b) => a.concat(b)).reduce((memo, reviewer) => {
      const existingReviewer = memo.filter(user => user.id === reviewer.id)[0];
      if (existingReviewer) {
        existingReviewer.count++;
      } else {
        reviewer.count = 1;
        memo.push(reviewer);
      }
      return memo;
    }, []);
    return reviewers.sort((user1, user2) => {
      return user2.count > user1.count ? 1 : ((user1.count > user2.count) ? -1 : 0);
    });
  }));

  return axios.all([allPullRequestPromises, buildsPromise, allReviewerPromises])
    .then(axios.spread((pullRequests, builds, reviewers) => {
      return {pullRequests: pullRequests.reverse(), builds, reviewers};
    })
  );
}

export function getOpenPullRequests(repository) {
  const baseURL = getPullsBaseURL(repository);
  const url = `${baseURL}?access_token=${GITHUB_AUTH_TOKEN}&state=open`;
  return axios.get(url).then(response => response.data);
}

export function getReviewers(repository) {
  const baseURL = getPullsBaseURL(repository);
  const startingFrom = new Date();
  startingFrom.setMonth(startingFrom.getMonth() - 3);

  function getPullRequests(perPage, page) {
    const url = (
      `${baseURL}?access_token=${GITHUB_AUTH_TOKEN}&state=closed&per_page=${perPage}&page=${page}`
    );
    return axios.get(url).then(response => response.data);
  }

  function mergedAfterStartingFrom(pullRequest) {
    return new Date(pullRequest.merged_at) >= startingFrom;
  }

  function getPullRequestsRecursively(pullRequests, perPage, page) {
    return getPullRequests(perPage, page).then((newPullRequests) => {
      const pullRequestsAfterStartingFrom = newPullRequests.filter(mergedAfterStartingFrom);
      pullRequests = pullRequests.concat(pullRequestsAfterStartingFrom);
      if (
        pullRequestsAfterStartingFrom.length === newPullRequests.length &&
        newPullRequests.length === perPage
      ) {
        return getPullRequestsRecursively(pullRequests, perPage, page + 1);
      }
      return pullRequests;
    });
  }

  function getPullRequestReviewer(pullRequest) {
    const url = `${baseURL}/${pullRequest.number}?access_token=${GITHUB_AUTH_TOKEN}`;
    return axios.get(url).then(response => response.data.merged_by);
  }

  return getPullRequestsRecursively([], 100, 1).then(pullRequests => {
    const promises = pullRequests.filter(pr => pr.merged_at).map(getPullRequestReviewer);
    return axios.all(promises).then(axios.spread((...args) => args));
  });
}

function getPullsBaseURL(repository) {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${repository}/pulls`;
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
