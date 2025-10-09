# CC API via a CLI

Some examples of how to use the CC API via a CLI. This can be expanded on and adapted to suit individual usecases and is intended as a starting point to fork your own copy of.

[API Documentation](https://cloudcannon.com/api-documentation/)

Must be connected to a CloudCannon site to be affected by the CloudCannon API, even for things like git workflows.

## Getting Started
1. Set up an API key and grab your org UUID in CC, from `Org Settings > Sharing > API Keys`. Make sure to pay attention to what permissions & scope you give your API key, and keep this key private.
2. Run `npm install`
3. Set up a `.env` file like below, adding your own values to each secret key.

```bash
CC_API_KEY="**************************"
CC_ORG_UUID="***********************"
```

## Update Branches by Repo
Change multiple repo's branches at the same time. 

1. Go to `updateBranchesByRepo.js` and add your branch and repo details. You can set multiple repos that you need to change a branch for. The branch being changed and the name it's changing to are the same for all the repos.

```javascript
const reposToChangeBranches = ["tomrcc/persyporty", "tomrcc/recipe-book"];
const branchToChange = "staging";
const branchToChangeTo = "main";
```

2. Run `npm run update-branches-by-repos` in the root of the project.

## Update Branches by Site
Change multiple site's branches at the same time.

1. Go to `updateBranchesBySiteNames.js` and add your branch and repo details. You can set multiple sites that you need to change the source branch for at once.

```javascript
const sitesToChangeBranches = ["Personal Port"];
const branchToChangeTo = "main";
```

2. Run `npm run update-branches-by-site-names` in the root of the project.

## Update Branches by Site
Merge changes from one branch into multiple other branches at the same time.

1. Go to `mergeBranchesInRepo.js` and add your branch and repo details. You can set multiple destination branches to merge the changes from the source branch into.

```javascript
const repoToChangeBranches = "tomrcc/persyporty";
const branchToMergeFrom = "staging";
const branchesToMergeTo = ["main"];
```

2. Run `npm run merge-branches-in-repo` in the root of the project.
