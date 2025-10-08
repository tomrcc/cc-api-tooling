import "dotenv/config";

// Changes the branches of any sites using these repos with branchToChange from branchToChange to branchToChangeTo
// Details of repos and branches to change
const reposToChangeBranches = ["tomrcc/persyporty", "tomrcc/recipe-book"];
const branchToChange = "staging";
const branchToChangeTo = "main";

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

  await Promise.all(
    reposToChangeBranches.map(async (repo) => {
      // Find the CC site(s) that are connected to the repos we're trying to change
      for (const site of siteList) {
        if (
          site.storage_provider_details?.full_name === repo &&
          site.storage_provider_details.branch === branchToChange
        ) {
          const branchListUrl = `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers/branches`;

          // Get a list of all the branches connected to the repo that the site is built off
          // These are the available branches to change to for a particular CC site
          let branchList;
          try {
            const response = await fetch(branchListUrl, {
              method: "GET",
              headers: requestHeader,
            });

            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
            }

            branchList = await response.json();
          } catch (error) {
            console.error(error.message);
          }

          // Check the list of branches to check the branchToChangeTo exists on the repo
          await Promise.all(
            branchList.map(async (branch) => {
              if (branch.name === branchToChangeTo) {
                const updateBranchUrl = `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers`;
                const bodyContent = {
                  custom_data: {
                    full_name: repo,
                    branch: branchToChangeTo,
                  },
                };

                // Update the CC site to use the branchToChangeTo
                try {
                  const response = await fetch(updateBranchUrl, {
                    method: "PUT",
                    headers: requestHeader,
                    body: JSON.stringify(bodyContent),
                  });
                } catch (error) {
                  console.error(error.message);
                }
              }
            })
          );
        }
      }
    })
  );

  // Since the API returns 500 sometimes, we need to manually check its updated branches
  const updatedSiteListUrl = `https://app.cloudcannon.com/api/v0/orgs/${org_uuid}/sites`;
  let updatedSiteList;
  // Fetch a list of sites on the org to get their uuids
  try {
    const response = await fetch(updatedSiteListUrl, {
      method: "GET",
      headers: requestHeader,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    updatedSiteList = await response.json();
  } catch (error) {
    console.error(error.message);
  }

  await Promise.all(
    reposToChangeBranches.map(async (repo) => {
      for (const site of updatedSiteList) {
        if (site.storage_provider_details?.full_name === repo) {
          if (site.storage_provider_details.branch === branchToChangeTo) {
            console.log(
              `Successfully updated the branch for repo: ${repo}, for site: ${site.site_name}. Changed the branch ${branchToChange} to ${branchToChangeTo}.`
            );
          } else {
            console.log(
              `Did not update the branch for repo: ${repo}, for site: ${site.site_name}. The site is still using the branch: ${site.storage_provider_details.branch}.`
            );
          }
        }
      }
    })
  );
})();
