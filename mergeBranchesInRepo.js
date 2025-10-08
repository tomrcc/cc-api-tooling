import "dotenv/config";

// Publish a change on one branch to multiple branches at once
// For any site that on CloudCannon that is synced to the repoToChangeBranches
// Typically used for monorepos using multiple branches for different sites
const repoToChangeBranches = "tomrcc/persyporty";
const branchToMergeFrom = "main";
const branchesToMergeTo = ["staging"];

(async () => {
  // Keep this private - don't push to src control & use an env variable
  // Can get apiKey from org settings > sharing > api keys. Set using env variables.
  const apiKey = process.env.CC_API_KEY;
  // Can get org_uuid from org settings > sharing > api keys. Set using env variables.
  const org_uuid = process.env.CC_ORG_UUID;
  const requestHeader = {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
  };

  const siteListUrl = `https://app.cloudcannon.com/api/v0/orgs/${org_uuid}/sites`;
  let siteList;
  // Fetch a list of sites on the org to get their uuids
  try {
    const response = await fetch(siteListUrl, {
      method: "GET",
      headers: requestHeader,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    siteList = await response.json();
  } catch (error) {
    console.error(error.message);
  }

  // Uncomment this console log to check what API data is available for the sites in your org
  // console.log({ siteList });

  for (const site of siteList) {
    // Find the site on CC that belongs to the repoToChangeBranches on branch branchToMergeFrom
    if (
      site.storage_provider_details.full_name === repoToChangeBranches &&
      site.storage_provider_details.branch === branchToMergeFrom
    ) {
      // console.log({ site });
      console.log(
        `Found a CloudCannon site belonging to the repo ${repoToChangeBranches}, from branch ${branchToMergeFrom}.`
      );
      const branchListUrl = `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers/branches`;

      // Get a list of all the branches connected to the repo that the site is built off
      // These are the available branches to publish to for a particular CC site
      let branchList;
      try {
        const response = await fetch(branchListUrl, {
          method: "GET",
          headers: requestHeader,
        });

        branchList = await response.json();
      } catch (error) {
        console.error(error.message);
      }
      // TODO:
      // Check the site uses the branch to merge from
      // Loop through the branches to publish through and
      // // Make that the new publish branch
      // // Compare if there are any changes (if ahead > 0 by since we're on the branchToMergeFrom) to make
      // If not don't need to merge and console as much
      // // Merge changes to that branch
      // // Compare if there are any changes (if ahead > 0 by since we're on the branchToMergeFrom) still to make
      // // If not we've been successful
      // // Go to the next branch in the loop

      for (const branchToMergeTo of branchesToMergeTo) {
        await Promise.all(
          branchList.map(async (branch) => {
            // if (branch !== branchToMergeTo) {
            //   return;
            // }
            const publishBranchUrl = `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers/branches/publish`;
            const bodyContent = {
              branch: branchToMergeTo,
            };

            try {
              const response = await fetch(publishBranchUrl, {
                method: "POST",
                headers: requestHeader,
                body: JSON.stringify(bodyContent),
              });

              console.log(
                `Sent a post request to update the site's publish branch to ${branchToMergeTo}`
              );
            } catch (error) {
              console.error(error.message);
            }

            try {
              const response = await fetch(
                `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers/branches/publish/compare`,
                {
                  method: "GET",
                  headers: requestHeader,
                }
              );

              if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
              }

              console.log({ response });
              const publishBranchStatus = JSON.parse(response);
              // Check if there are any changes to publish to publish branch
              if (publishBranchStatus.ahead_by <= 0) {
                console.log(
                  `Nothing to merge to publish branch: ${branchToMergeTo}`
                );
                // return;
              }
            } catch (error) {
              console.error(error.message);
            }

            // Perform a merge (to publish branch)
            const mergeUrl = `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers/branches/merge`;

            try {
              const response = await fetch(mergeUrl, {
                method: "POST",
                headers: requestHeader,
              });

              if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
              }

              console.log(`Sent merge request to branch ${branchToMergeTo}`);
            } catch (error) {
              console.error(error.message);
            }

            try {
              const response = await fetch(
                `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers/branches/publish/compare`,
                {
                  method: "GET",
                  headers: requestHeader,
                }
              );

              if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
              }

              const updatedPublishBranchStatus = JSON.parse(response);

              // Check if there are any changes to publish to publish branch
              if (updatedPublishBranchStatus.ahead_by <= 0) {
                console.log(
                  `Successfully merged branch: ${branchToMergeFrom}, into branch: ${branchToMergeTo}.`
                );
                // return;
              }
            } catch (error) {
              console.error(error.message);
            }
          })
        );
        return;
      }
    }
  }
})();
