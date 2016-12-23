import axios from 'axios';

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
import { CircleFetcher } from './circle';

export default function getProjectData() {
  const circleFetcher = new CircleFetcher(
    CIRCLE_OWNER,
    CIRCLE_PROJECT_NAME,
    CIRCLE_BUILD_BRANCH,
    CIRCLE_AUTH_TOKEN
  );
  const reviewersStartingFrom = new Date();
  reviewersStartingFrom.setMonth(reviewersStartingFrom.getMonth() - 3);
  const githubFetcher = new GithubFetcher(GITHUB_OWNER, GITHUB_PROJECT_NAMES, GITHUB_AUTH_TOKEN);

  return axios.all([
    githubFetcher.getOpenPullRequests(),
    githubFetcher.getReviewers(reviewersStartingFrom),
    circleFetcher.getBuilds()
  ]).then(axios.spread((pullRequests, reviewers, builds) => (
    { pullRequests, reviewers, builds }
  )));
}
