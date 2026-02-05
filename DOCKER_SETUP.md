# Docker Setup for Supabase CLI

## Issue

The error `failed to inspect container health` means Docker is not running or not accessible. Supabase CLI requires Docker to run local services.

## Solution Options

### Option 1: Install and Start Docker Desktop (Recommended for Local Development)

#### Step 1: Install Docker Desktop

1. **Download Docker Desktop for Windows**:
   - Go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Run the installer

2. **Install Docker Desktop**:
   - Follow the installation wizard
   - Make sure "Use WSL 2 instead of Hyper-V" is checked (recommended)
   - Restart your computer if prompted

3. **Start Docker Desktop**:
   - Open Docker Desktop from Start menu
   - Wait for it to fully start (whale icon in system tray should be steady)
   - You may need to accept the license agreement

#### Step 2: Verify Docker is Running

Open PowerShell and run:

```powershell
docker --version
docker ps
```

You should see Docker version info and an empty container list (or running containers).

#### Step 3: Run Supabase Commands

Now you can run:

```powershell
supabase status
supabase start
```

### Option 2: Work with Remote Supabase (No Docker Needed)

If you don't want to install Docker, you can work directly with your remote Supabase project without local services:

#### Link to Remote Project

```powershell
supabase link --project-ref raezmmfgjkrivybtmptv
```

This connects to your remote Supabase project without needing Docker.

#### Deploy to Remote

```powershell
# Deploy database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy ai-api
```

**Note**: `supabase status` and `supabase start` require Docker, but `supabase link`, `supabase db push`, and `supabase functions deploy` work without Docker when connected to a remote project.

### Option 3: Use Supabase Dashboard (No Docker or CLI Needed)

You can deploy everything using the web dashboard:
- See: `DEPLOY_WITHOUT_CLI.md`

## Troubleshooting

### Docker Desktop Not Starting

1. **Check WSL 2**:
   ```powershell
   wsl --status
   ```
   If WSL 2 is not installed, Docker Desktop will guide you through installation.

2. **Run as Administrator**:
   - Right-click Docker Desktop → Run as Administrator

3. **Check Windows Features**:
   - Press `Win + R` → `optionalfeatures`
   - Ensure "Virtual Machine Platform" and "Windows Subsystem for Linux" are enabled

### Docker Command Not Found

1. **Restart terminal** after installing Docker Desktop
2. **Verify PATH**: Docker Desktop should add itself to PATH automatically
3. **Check installation**: Docker Desktop should be in Start menu

### Permission Errors

If you see permission errors:
1. **Run PowerShell as Administrator**
2. **Or** add your user to the "docker-users" group:
   - Press `Win + X` → Computer Management
   - Local Users and Groups → Groups → docker-users
   - Add your user account

## Quick Check Commands

```powershell
# Check if Docker is installed
docker --version

# Check if Docker is running
docker ps

# Check Docker service status
Get-Service -Name "*docker*"

# Check if Docker Desktop is running
Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
```

## Recommended Approach

For your use case (deploying to production), you have two good options:

1. **Install Docker Desktop** - If you want to test locally first
2. **Work with Remote Project** - Skip Docker, link to remote, and deploy directly

Since you're deploying to production (`raezmmfgjkrivybtmptv.supabase.co`), you can skip Docker and work directly with the remote project!
