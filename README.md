# CC API via a CLI

Some examples of how to use the CC API via a CLI. This can be expanded on and adapted to suit individual usecases and is intended as a starting point to fork your own copy of.

## Update Branches

1. Set up an API key and grab your org UUID in CC, from `Org Settings > Sharing > API Keys`. Make sure to pay attention to what permissions & scope you give your API key, and keep this key private.
2. Run `npm install`
3. Set up a `.env` file like below, adding your own values to each secret key.

```bash
CC_API_KEY="**************************"
CC_ORG_UUID="***********************"
```

4. Go to `updateBranches.js` and add your branch and repo details. You can set multiple repos that you need to change a branch for. The branch being changed and the name it's changing to are the same for all the repos.

```javascript
const reposToChangeBranches = ["tomrcc/persyporty", "tomrcc/recipe-book"];
const branchToChange = "staging";
const branchToChangeTo = "main";
```

5. Run `npm run update-branches`.
6. A `500` status code is received back (?), but the site's with the branch to update should now be updated to the new branch.
