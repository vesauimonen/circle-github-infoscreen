import React from 'react';

import {CIRCLE_PROJECT_NAME} from '../constants';
import {getProjectData} from '../utils/helpers';
import PullRequests from './pull-requests/PullRequests';
import BuildSuccessRates from './build-success-rates/BuildSuccessRates';
import Reviewers from './reviewers/Reviewers';


class Main extends React.Component {
  constructor() {
    super();
    const RELOAD_INTERVAL = 60 * 1000;
    this.state = {builds: [], pullRequests: [], reviewers: []};
    this.interval = setInterval(() => {
      this.loadStateData();
    }, RELOAD_INTERVAL);
  }

  componentDidMount() {
    this.loadStateData();
  }

  componentWillUnmount() {
    this.interval.clearInterval();
  }

  loadStateData() {
    return getProjectData().then(this.setState.bind(this));
  }

  render() {
    return (
      <div className="content">
        <PullRequests pullRequests={this.state.pullRequests} />
        <BuildSuccessRates
          repository={CIRCLE_PROJECT_NAME}
          builds={this.state.builds} />
        <Reviewers reviewers={this.state.reviewers} />
      </div>
    );
  }
}

export default Main;
