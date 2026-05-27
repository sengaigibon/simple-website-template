# Multi-Client Theme-Switcher Website

## 1. Overview

A single static website codebase that:
- Supports multiple visual **Layouts** (structural HTML templates) and **Styles** (CSS files)
- Can be deployed to multiple **Cloudflare Pages projects**, one per client
- Each deployment is independently configured with a chosen Layout+Style combination and client-specific content
- Includes a **Theme Switcher** UI for showroom / demo purposes
- No backend, no CMS, no framework — pure HTML/CSS/JS with a lightweight bash build script



## 2. Local Set Up

 ```` bash 
cd /home/MyCoolProjects
git clone git@github.com:sengaigibon/simple-website-template.git
    
cd simple-website-template
CLIENT_ID=client-1 bash build.sh
cd dist && python3 -m http.server 8080
 ````

Now you can access it through http://localhost:8080/

See the configuration for each client in, e.g. for client-1
````
simple-website-template/clients/client-1/clients/client-1/client.config.json
````
where there is a flag:
````
"demo_mode": true,
````
which enables/disables the Showroom / Demo mode.


## 3. Clodflare Set Up

- On the Account Home:
    - Add -> Pages -> Import an existing Git repository
- Select repository
    - Choose your repository -> Begin setup
- Set up builds and deployments
    - Give a name to your project
    - Build command: **bash build.sh**
    - Build output: **dist**
- Deploy site

Current Showroom URL: https://showroom-ean.pages.dev/ 

# Workflow

