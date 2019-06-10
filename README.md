## Step 1: Static HTTP server with apache httpd
In this step, the goal is to create a html webpage and store it in an apache PHP server that we will run in a Docker container.

### Dockerfile
apache version : 7.2
docker file content :

    FROM php:7.2-apache
    
	COPY content/ /var/www/html/ 
    
   According to our implementation we will need to store our webpage in a folder named content located in the same directory as the Dockerfile. We used a template found on [https://startbootstrap.com](https://startbootstrap.com/).
### Apache configuration
We have the possibility to change the apache configuration, for example we can change where our webpage is located. To do this run a bash in your container using :

    docker exec -it <container_name> /bin/bash
    
  Now you can explore the content of the apache server. We find the .conf files located  in `/etc/apache2/sites_available/`

### Build and test
To test what we've done we need to build the docker image with the following command :

    docker build -t res/apache_php .
  - -t let us name the image res/apache_php.
  - . tells docker to build the image with the Dockerfile located in the current folder.
 
 We can now run the container :
 

    docker run -d -p 8080:80 res/apache_php
- -d runs the container in background.
- -p let us map the ports of the container to match the ports of the vm who helds the containers so we can access the webpage from outside the outside ( like the browser ).
- res/apache_php is the image we build on.

To test it find our vm address using the command :

    docker-machine ls
   outside of the  vm then simply connect to it using telnet :  
    `telnet 192.168.99.100 8080` 
    or your browser
     `192.168.99.100:8080`
     on the port mapped previously (8080)
## Step 2 - Dynamic HTTP server with express.js
In this step, the goal is to create a dynamic web page using node.js. 
### Dockerfile
Node version 6.2.2
docker file content :

    FROM node:6.2.2
    
    COPY src /opt/app
    
    CMD ["node", "/opt/app/index.js"]
    
   ### Application 
   In our src folder we run the `npm init` command to prepare our package.json ans the dependecies need for our application.
   We used chance.js to get get random animals based on their types.
### Build and test
Run this two commands and test like the previous step changing ports. (8090)

    docker build -t res/express_dynamic_animals .
    docker run -d -p 8090:80 res/express_dynamic_animals

## Step 3: Reverse proxy with apache (static configuration)
In this step, the goal is to create a proxy to let us connect to both of the two containers we created in step 1 and 2. Also we wanted to change the address to `reverse.res.ch`.
### Dockerfile
We took the same apache server image from step 1.
content :

    FROM php:7.2-apache 
    
    COPY conf/ /etc/apache2
    
    RUN a2enmod proxy proxy_http
    RUN a2ensite 000-* 001-*

  We enable the modules `proxy` and `proxy_http` with the command `a2enmod`. The sites are enabled with the method `a2ensite`.
### VirtualHosts

In the  `conf`  folder, we have a folder  `sites-available`  with 2 Virtualhosts inside. The 2 files are  `000-default.conf`  and  `001-reverse-proxy.conf`. 

    # 000-default.conf
    <VirtualHost *:80>
    </VirtualHost>
 

    # 001-reverse-proxy.conf
    <VirtualHost *:80>
        ServerName reverse.res.ch
    
        ProxyPass "/api/animals/" "http://172.17.0.3:3000/"
        ProxyPassReverse "/api/animals/" "http://172.17.0.3:3000/"
    
        ProxyPass "/" "http://172.17.0.2:80/"
        ProxyPassReverse "/" "http://172.17.0.2:80/"
    </VirtualHost>

We can see in the reverse-proxy configuration file that we hard coded the IP addresses of the two different container. To get the IP addresses

    inspect docker inspect <container_name> | grep -i ipaddress

In our case we had for this run :

| Container name | Address:port |
|--|--|
| apache_static | 172.17.0.2:80 |
| express_dynamic | 172.17.0.3:3000 |
| apache_rp | 172.17.0.4:8100 |

***This value can be different depending on wich container we start first and if we have different containers running.***
### Host files
The browser need to send a specific header to know where to redirect the request. To do so, we have to change the DNS configuration. First find the host file of your system, then add a new line like this.

    192.168.99.100 reverse.res.ch
 This line is specific for windows docker since my docker vm has this address if you run docker natively just put the address of your reverse proxy apache server (in our case it would have been 172.17.0.4).
 ### Problems 
 This implementation is fragile cause we hardcoded the addresses of each container. In case we don't run in the same order/don't get the same addresses it won't work. We will improve this in step 5.
 ### Build and test
 This time we runned the containers with the option `--name <container name>` to look for their ip address easier.
 

    docker run -d --name apache_static res/apache_php
    docker run -d --name dynamic_animals res/express_dynamic_animals
    docker build -t res/apache_rp .
    docker run -d --name apache_rp -p 8080:80 res/apache_rp

We can now access our step 1 or 2 putting in our browser `reverse.res.ch:8080` or `reverse.res.ch:8080/api/animals`