import _ from 'underscore';
import axios from 'axios';

export class CircleFetcher {
  constructor(owner, repository, branch, authToken) {
    this.owner = owner;
    this.repository = repository;
    this.branch = branch;
    this.authToken = authToken;
    this.circleAPI = axios.create({
      baseURL: `https://circleci.com/api/v1/project/${owner}/${repository}`,
    });
  }

  getBuilds() {
    return this._getBuildsRecursively([], 0)
      .then(builds => builds.filter(b => b.outcome !== 'timedout'));
  }

  _getBuildsRecursively(memo, offset) {
    const PER_PAGE_MAX = 100;
    const filter = 'completed';
    return this._getBuildsFromCircle({ limit: PER_PAGE_MAX, offset, filter }).then((newBuilds) => {
      memo = memo.concat(newBuilds);
      if (newBuilds.length === PER_PAGE_MAX) {
        return this._getBuildsRecursively(memo, offset + PER_PAGE_MAX);
      }
      return memo;
    });
  }

  _getBuildsFromCircle(queryParams) {
    const params = _.extend(queryParams, { 'circle-token': this.authToken });
    const headers = { Accept: 'application/json' };
    return this.circleAPI.get(`/tree/${this.branch}`, { params, headers })
      .then(response => (response.data));
  }


}

export function getSuccessRate(builds) {
  const totalSuccessfulBuilds = builds.filter(b => b.outcome === 'success').length;
  const totalFailedBuilds = builds.filter(b => b.outcome === 'failed').length;
  return Math.floor((totalSuccessfulBuilds / (totalSuccessfulBuilds + totalFailedBuilds)) * 100);
}

export function getSuccessRatesByMonth(builds) {
  const buildsByMonth = builds.reduce((memo, build) => {
    const buildMonth = getBuildMonth(build);
    if (_.last(memo) && _.last(memo).month === buildMonth) {
      _.last(memo).builds.push(build);
    } else {
      memo.push({ month: buildMonth, builds: [build] });
    }
    return memo;
  }, []);

  const successRatesByMonth = [];

  buildsByMonth.forEach((buildGroup, i) => {
    const successRate = { month: buildGroup.month, value: getSuccessRate(buildGroup.builds) };
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

