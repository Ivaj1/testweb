const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function run() {
  const folderPath = 'Imagenes'; // La ruta a la carpeta que quieres leer
  const folderContents = fs.readdirSync(folderPath); // Lee el contenido de la carpeta
  const fileContent = folderContents.join('\n'); // Crea una cadena con los nombres de los archivos separados por una nueva línea

  const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
  const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
  const filePath = 'archivo.txt'; // La ruta al archivo que quieres actualizar
  const commitMessage = 'Actualiza el archivo con los nombres de los archivos de la carpeta Imagenes';

  const { data: { sha } } = await octokit.repos.getContent({ owner, repo, path: filePath });
  const { data: { commit } } = await octokit.git.getCommit({ owner, repo, commit_sha: sha });
  const tree = await octokit.git.getTree({ owner, repo, tree_sha: commit.tree.sha, recursive: true });

  const file = tree.data.tree.find(file => file.path === filePath);
  const blob = await octokit.git.createBlob({ owner, repo, content: fileContent });
  const treeUpdates = tree.data.tree.filter(file => file.path !== filePath);
  treeUpdates.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.data.sha });

  const newTree = await octokit.git.createTree({
    owner,
    repo,
    tree: treeUpdates,
    base_tree: commit.tree.sha,
  });

  const newCommit = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTree.data.sha,
    parents: [commit.sha],
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${process.env.GITHUB_REF.split('/')[2]}`,
    sha: newCommit.data.sha,
  });
}

run().catch(console.error);
