# Medi - Medical Platform

A modern medical platform for the Moroccan market that allows patients to book appointments with doctors online.

---

## Setup

### Step 1 - Clone Project

```bash
git clone https://github.com/aymanbelarbi/medi.git
cd medi
code .
```

---

### Step 2 - Install Docker

Windows/Mac:

- Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- Run the installer
- Restart your computer

Linux:

- Ubuntu/Debian:

```bash
sudo apt install docker.io docker-compose
```

- Fedora:

```bash
sudo dnf install docker docker-compose
```

- Arch:

```bash
sudo pacman -S docker docker-compose
```

Check if installed:

```bash
docker --version
docker-compose --version
```

---

### Step 3 - Create Configuration Files

Windows (Command Prompt):

```bash
copy frontend\.env.example frontend\.env
copy backend\.env.example backend\.env
```

Windows (PowerShell):

```powershell
Copy-Item frontend\.env.example frontend\.env
Copy-Item backend\.env.example backend\.env
```

Mac/Linux (Terminal):

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

---

### Step 4 - Start Everything

Open Terminal/Command Prompt in project folder and run:

```bash
docker-compose up --build
```

Wait until it finishes, then open your browser and go to:
[http://localhost:3000](http://localhost:3000)

---

## Admin Account

The seeded default administrator account is:

- Email: `admin@medi.ma`
- Password: `password`

---

## Common Commands

Check if everything is running:

```bash
docker-compose ps
```

Stop the project:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f
```

Reset everything (delete database):

```bash
docker-compose down -v
docker-compose up --build
```

View specific service logs:

```bash
docker-compose logs backend    # Backend logs
docker-compose logs medi-db    # Database logs
docker-compose logs frontend   # Frontend logs
```

Linux users: Add sudo before each command:

```bash
sudo docker-compose ps
```
