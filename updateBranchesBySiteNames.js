import "dotenv/config";

// Changes the branches of any sites using these repos with branchToChange from branchToChange to branchToChangeTo
// Details of repos and branches to change
const sitesToChangeBranches = ["Personal Port"];
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
    sitesToChangeBranches.map(async (siteName) => {
      // Find the CC site(s) we're trying to change
      for (const site of siteList) {
        if (site.site_name === siteName) {
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
                    full_name: site.storage_provider_details.full_name,
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

  // Since the API returns 500 for a put request sometimes, we need to manually check it's updated branches
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
    sitesToChangeBranches.map(async (siteName) => {
      for (const site of updatedSiteList) {
        // Find the details of the site we're changing
        if (site.site_name === siteName) {
          // Check if the site has the branch on the correct one
          if (site.storage_provider_details.branch === branchToChangeTo) {
            console.log(
              `Successfully updated site: ${site.site_name}, to use the branch: ${branchToChangeTo}.`
            );
          } else {
            console.log(
              `Failed to update site: ${site.site_name}, to use branch ${branchToChangeTo}. Still using branch: ${site.storage_provider_details.branch}.`
            );
          }
        }
      }
    })
  );
})();
