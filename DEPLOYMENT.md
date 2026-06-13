# GitHub Pages Deployment Setup

This document explains how to set up automatic deployment of your Biking Website to GitHub Pages using GitHub Actions.

## What's Been Set Up

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Automatically triggers on pushes to the `main` branch
   - Builds the React application using Vite
   - Deploys the built files to GitHub Pages

## Setup Instructions

### 1. Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: https://github.com/Saathvik-Choudhary/Travel-Website
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch and **/ (root)** folder
6. Click **Save**

### 2. Repository Permissions

Make sure your repository has the following permissions enabled:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Save changes

### 3. Push Your Code

The workflow will automatically trigger when you push changes to the `main` branch:

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 4. Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Once completed, your site will be available at: `https://saathvik-choudhary.github.io/Travel-Website/`

## How It Works

### Workflow Triggers
- **Push to `main` branch**: Automatically builds and deploys
- **Pull requests to `main` branch**: Builds but doesn't deploy (for testing)

### Build Process
1. Checks out the code
2. Sets up Node.js 18
3. Installs dependencies with `npm ci`
4. Builds the project with `npm run build`
5. Uploads the `dist` folder as an artifact

### Deployment Process
1. Takes the built artifact
2. Deploys it to GitHub Pages
3. Makes the site live at your GitHub Pages URL

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the Actions tab for error details
   - Ensure all dependencies are in `package.json`
   - Verify the build works locally with `npm run build`

2. **Deployment Fails**
   - Ensure GitHub Pages is enabled in repository settings
   - Check that the repository has proper permissions
   - Verify the workflow file is in `.github/workflows/`

3. **Site Not Updating**
   - GitHub Pages can take a few minutes to update
   - Check the Actions tab to ensure deployment completed successfully
   - Try hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Manual Deployment

If you need to manually trigger a deployment:
1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow**

## File Structure

```
.github/
└── workflows/
    └── deploy.yml          # GitHub Actions workflow
dist/                       # Built files (generated)
├── index.html
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── [other assets]
└── ...
```

## Environment Variables

No environment variables are required for this setup. The workflow uses GitHub's built-in tokens for authentication.

## Security Notes

- The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub
- No sensitive data is stored in the workflow file
- The deployment only happens from the `main` branch for security
