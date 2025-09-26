import "dotenv/config";

(async () => {
  // Keep this private - don't push to src control & use an env variable
  // Can get apiKey from org settings > sharing > api keys. Set using env variables.
  const apiKey = process.env.CC_API_KEY;
  // Can get org_uuid from org settings > sharing > api keys. Set using env variables.
  const org_uuid = process.env.CC_ORG_UUID;

  // Details of repos and branches to change
  const reposToChangeBranches = ["tomrcc/persyporty", "tomrcc/recipe-book"];
  const branchToChange = "staging";
  const branchToChangeTo = "main";

  const siteListUrl = `https://app.cloudcannon.com/api/v0/orgs/${org_uuid}/sites`;
  let siteList;
  // Fetch a list of sites on the org to get their uuids
  try {
    const response = await fetch(siteListUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
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

  for (const repo of reposToChangeBranches) {
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
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": apiKey,
            },
          });

          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }

          branchList = await response.json();
        } catch (error) {
          console.error(error.message);
        }

        // Check the list of branches and update any that match the ones we want to change
        for (const branch of branchList) {
          if (branch.name === branchToChange) {
            console.log(
              `Changing ${branchToChange} to ${branchToChangeTo} from repository ${site.storage_provider_details.full_name} on site: ${site.site_name}`
            );
            const updateBranchUrl = `https://app.cloudcannon.com/api/v0/sites/${site.uuid}/providers`;
            const bodyContent = {
              custom_data: {
                full_name: repo,
                branch: branchToChangeTo,
              },
            };

            try {
              const response = await fetch(updateBranchUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "X-API-KEY": apiKey,
                },
                body: JSON.stringify(bodyContent),
              });
              console.log("Sent put request!");
              if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
              }
            } catch (error) {
              console.error(error.message);
            }
          }
        }
      }
    }
  }
})();
