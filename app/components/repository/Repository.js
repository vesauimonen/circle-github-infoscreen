import React from 'react';

import {getProjectData} from '../../utils/helpers';
import PullRequests from '../pull-requests/PullRequests';
import BuildSuccessRates from '../build-success-rates/BuildSuccessRates';


class Repository extends React.Component {


  constructor() {
    super();
    const RELOAD_INTERVAL = 60 * 1000;
    this.state = {builds: [], pullRequests: []};
    this.interval = setInterval(() => {
      this.loadStateData(this.props.params.owner, this.props.params.repository);
    }, RELOAD_INTERVAL);
  }

  componentDidMount() {
    this.loadStateData(this.props.params.owner, this.props.params.repository);
  }

  componentWillReceiveProps(nextProps) {
    this.loadStateData(nextProps.params.owner, nextProps.params.repository);
  }

  componentWillUnmount() {
    this.interval.clearInterval();
  }

  loadStateData(owner, repository) {
    return getProjectData(owner, repository, 'develop').then(this.setState.bind(this));
  }

  render() {
    return (
      <div className="repository-container">
        <BuildSuccessRates
          repository={this.props.params.repository}
          builds={this.state.builds} />
        <PullRequests
          repository={this.props.params.repository}
          pullRequests={this.state.pullRequests} />
      </div>
    );
  }
}

Repository.propTypes = {
  params: React.PropTypes.object.isRequired
};

export default Repository;
