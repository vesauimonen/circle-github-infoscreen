export const {
  GITHUB_OWNER,
  GITHUB_AUTH_TOKEN,
  CIRCLE_AUTH_TOKEN,
  CIRCLE_OWNER,
  CIRCLE_BUILD_BRANCH,
  CIRCLE_PROJECT_NAME
} = process.env;

export const GITHUB_PROJECT_NAMES = process.env.GITHUB_PROJECT_NAMES
  .split(',')
  .filter(s => s.length);
