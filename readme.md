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

- client chooses theme and style; it's a new client, not one in the existing list, let's say their called Vierszka

- so I will create a new folder under clients: vierszka, for its own config, I would copy the json file from e.g. client-2 and place it here, together with an assets folder and at least set up there the theme and style chosen by the client.. Client should have provided a logo at least. Commit changes to the repository

- For the page content, I want to define a mechanism so that the client (or myself) can define it initially, I was thinking in a configuration page OR using keystatic, let's stick to keystatic. Therefore, i need to set it up for each client, or how does it work? Once the initial client config is in the repository, then I have to connect keystatic to that specific client directory in the repo

- In the meantime, while content is being chosen or defined, I can setup cloudflare for this client. The config is in the repo already although may be incomplete. So basically I just need to do what the section "3. Cloudflare Set Up" describes. The outcome must be a website with a testing url provided by Cloudflare

- At some point I have to assist either in the domain name buying in or in the transfer to Cloudflare. Outcome: the website accesible via the client's domain name.

- This is done when:
    1. The client knows how to set/modify the website's content (using keystatic)
    2. The client's content was defined and has been deployed into Cloudflare
    3. The new website is accessible via the client's domain name
    