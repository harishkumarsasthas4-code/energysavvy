// src/github/githubClient.js
const { Octokit } = require('@actions/github');

class GitHubClient {
  constructor(token, context) {
    this.octokit = new Octokit({ auth: token });
    this.context = context;
  }

  async getPRDetails() {
    const { owner, repo } = this.context.repo;
    const prNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    });

    return {
      number: prNumber,
      title: data.title,
      body: data.body,
      headSha: data.head.sha,
      baseSha: data.base.sha,
      author: data.user.login,
      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files
    };
  }

  async getPRDiff() {
    const { owner, repo } = this.context.repo;
    const prNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: 'diff' }
    });

    return data;
  }

  async getPRFiles() {
    const { owner, repo } = this.context.repo;
    const prNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    });

    return data;
  }

  async getFileContent(filePath, ref) {
    const { owner, repo } = this.context.repo;

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref
      });

      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
    } catch (error) {
      return null;
    }
  }

  async createCheckRun(name, headSha, conclusion, output) {
    const { owner, repo } = this.context.repo;

    const { data } = await this.octokit.rest.checks.create({
      owner,
      repo,
      name,
      head_sha: headSha,
      status: 'completed',
      conclusion,
      output
    });

    return data;
  }

  async updateCheckRun(checkRunId, conclusion, output) {
    const { owner, repo } = this.context.repo;

    const { data } = await this.octokit.rest.checks.update({
      owner,
      repo,
      check_run_id: checkRunId,
      status: 'completed',
      conclusion,
      output
    });

    return data;
  }

  async createPRComment(body) {
    const { owner, repo } = this.context.repo;
    const issueNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body
    });

    return data;
  }

  async updatePRComment(commentId, body) {
    const { owner, repo } = this.context.repo;

    const { data } = await this.octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body
    });

    return data;
  }

  async deletePRComment(commentId) {
    const { owner, repo } = this.context.repo;

    await this.octokit.rest.issues.deleteComment({
      owner,
      repo,
      comment_id: commentId
    });
  }

  async listPRComments() {
    const { owner, repo } = this.context.repo;
    const issueNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber
    });

    return data;
  }

  async createPRReview(body, event = 'COMMENT') {
    const { owner, repo } = this.context.repo;
    const pullNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body,
      event
    });

    return data;
  }

  async addLabels(labels) {
    const { owner, repo } = this.context.repo;
    const issueNumber = this.context.payload.pull_request.number;

    const { data } = await this.octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels
    });

    return data;
  }

  async removeLabel(label) {
    const { owner, repo } = this.context.repo;
    const issueNumber = this.context.payload.pull_request.number;

    await this.octokit.rest.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name: label
    });
  }

  async setPRStatus(state, context, description) {
    const { owner, repo } = this.context.repo;
    const sha = this.context.payload.pull_request.head.sha;

    const { data } = await this.octokit.rest.repos.createCommitStatus({
      owner,
      repo,
      sha,
      state,
      context,
      description
    });

    return data;
  }
}

module.exports = GitHubClient;