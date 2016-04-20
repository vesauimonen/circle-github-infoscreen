import React from 'react';


class SearchRepository extends React.Component {
  getOwnerRef(ref) {
    this.ownerRef = ref;
  }

  getRepoRef(ref) {
    this.repoRef = ref;
  }

  handleSubmit(e) {
    const owner = this.ownerRef.value;
    const repo = this.repoRef.value;
    this.context.router.push('/' + owner + '/' + repo);
    e.preventDefault();
  }

  render() {
    return (
      <form onSubmit={(e) => this.handleSubmit(e)}>
        <input type="text" ref={(ref) => this.getOwnerRef(ref)} placeholder="Username/organization"/>
        <span>/</span>
        <input type="text" ref={(ref) => this.getRepoRef(ref)} placeholder="Repository"/>
        <button type="submit">Go</button>
      </form>
    );
  }
}

SearchRepository.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default SearchRepository;
