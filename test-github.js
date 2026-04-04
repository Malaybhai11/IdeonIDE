import { Octokit } from "octokit";

const octokit = new Octokit();

async function run() {
  const { data } = await octokit.rest.git.getTree({
    owner: "Malaybhai11",
    repo: "IdeonIDE",
    tree_sha: "main",
    recursive: "true",
  });
  console.log("With 'true':", data.tree.length);

  const { data: data2 } = await octokit.rest.git.getTree({
    owner: "Malaybhai11",
    repo: "IdeonIDE",
    tree_sha: "main",
    recursive: "1",
  });
  console.log("With '1':", data2.tree.length);
}

run().catch(console.error);
