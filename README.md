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
    
  Now you can explore the content of the apache server. We find the .conf files located  

`/etc/apache2/sites_available/`

### Build and test
To test what we've done we need to build the docker image with the following command :

    docker build -t res/apache_php .
  options :
  - -t let us name the image res/apache_php
  - . tells docker to build the image with the Dockerfile located in the current folder
 
 We can now run the container :
 

    docker run -d -p 8080:80 res/apache_php
- -d runs the container in background
- -p let us map the ports of the container to match the ports of the vm who helds the containers so we can access the webpage from outside the outside ( like the browser ).
- res/apache_php is the image we build on

To test it find our vm address using the command :

    docker-machine ls
   outside of the  vm then simply connect to it using telnet :  
    `telnet 192.168.99.100 8080` 
    or your browser
     `192.168.99.100:8080`
     on the port mapped previously (8080)


   
