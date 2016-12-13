import _ from 'underscore';
import axios from 'axios';


class GithubRepositoryFetcher {
  constructor(owner, repository, authToken) {
    this.owner = owner;
    this.repository = repository;
    this.authToken = authToken;
    this.githubAPI = axios.create({
      baseURL: `https://api.github.com/repos/${this.owner}/${this.repository}`,
    });
  }

  getPullRequests(queryParams) {
    const params = _.extend(queryParams, { access_token: this.authToken });
    return this.githubAPI.get('/pulls', { params }).then(response => response.data);
  }

  getReviewersAfterDate(startDate) {
    return this._getClosedPullRequestsRecursively(startDate, [], 1).then((pullRequests) => {
      const reviewerPromises = pullRequests
        .filter(pr => pr.merged_at)
        .map(this._getPullRequestReviewer.bind(this));
      return axios.all(reviewerPromises).then(axios.spread((...args) => args));
    });
  }

  _getClosedPullRequestsRecursively(startDate, memo, page) {
    const PER_PAGE_MAX = 100;
    const queryParams = { state: 'closed', per_page: PER_PAGE_MAX, page };

    return this.getPullRequests(queryParams).then((fetchedPRs) => {
      const validPRs = fetchedPRs.filter(pr => new Date(pr.merged_at) >= startDate);
      memo = memo.concat(validPRs);
      if (validPRs.length === fetchedPRs.length && fetchedPRs.length === PER_PAGE_MAX) {
        return this._getClosedPullRequestsRecursively(startDate, memo, page + 1);
      }
      return memo;
    });
  }

  _getPullRequestReviewer(pullRequest) {
    const params = { access_token: this.authToken };
    return this.githubAPI.get(`/pulls/${pullRequest.number}`, { params })
      .then(response => response.data.merged_by);
  }
}


class GithubFetcher {
  constructor(owner, repositories, authToken) {
    this.owner = owner;
    this.repositories = repositories;
    this.authToken = authToken;
    this.repositoryFetchers = this.repositories
      .map(repo => new GithubRepositoryFetcher(this.owner, repo, this.authToken));
  }

  getOpenPullRequests() {
    const pullRequestPromises = axios.all(
      this.repositoryFetchers.map(fetcher => fetcher.getPullRequests({ state: 'open' }))
    );
    return pullRequestPromises.then(axios.spread((...prArrays) => (
      _.chain(prArrays).flatten().sortBy('created_at').value()
    )));
  }

  getReviewers(startDate) {
    const reviewerPromises = axios.all(
      this.repositoryFetchers.map(fetcher => fetcher.getReviewersAfterDate(startDate))
    );

    return reviewerPromises.then(axios.spread((...reviewerArrays) => {
      const reviewers = _.flatten(reviewerArrays).reduce((memo, reviewer) => {
        const existingReviewer = _.find(memo, u => u.id === reviewer.id);
        if (existingReviewer) {
          existingReviewer.count += 1;
        } else {
          reviewer.count = 1;
          memo.push(reviewer);
        }
        return memo;
      }, []);
      return _.sortBy(reviewers, 'count').reverse();
    }));
  }
}


export default GithubFetcher;
