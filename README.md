## Step 1: Static HTTP server with apache httpd
In this step, the goal is to create a html webpage and store it in an apache PHP server that we will run in a Docker container.

### Dockerfile
apache version : 7.2
docker file content :

    FROM php:7.2-apache
    
	COPY content/ /var/www/html/ 
    
   According to our implementation we will need to store our webpage in a folder named content located in the same directory as the Dockerfile. We used a template found on [https://startbootstrap.com](https://startbootstrap.com/).
### Apache configuration
We have the possibility to change the apache configuration, for example we can change where our webpage is located. To do this, run a bash in your container using :

    docker exec -it <container_name> /bin/bash
    
  Now you can explore the content of the apache server. We find the .conf files located  in `/etc/apache2/sites_available/`

### Build and test
To test what we did, we need to build the docker image with the following command :

    docker build -t res/apache_php .
  - -t let us name the image res/apache_php.
  - . tells docker to build the image with the Dockerfile located in the current folder.
 
 Now, we can run the container :
 

    docker run -d -p 8080:80 res/apache_php
- -d runs the container in background.
- -p let us map the ports of the container to match the ports of the vm who helds the containers so we can access the webpage from outside the outside ( like the browser ).
- res/apache_php is the image we build on.

To test it, find our vm address using the command :

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
The browser need to send a specific header to know where to redirect the request. To do so, we have to change the DNS configuration. First, find the host file of your system, then add a new line like this.

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
## Step 4 - AJAX requests with JQuery
In this step, the goal is to setup an AJAX request (not the cleaning product) with JQuery. The request will display on our web page (step1) the first of the random animals we get in our dynamic server (step 2)
### JavaScript
We created the file `animals.js` in the folder `apache-php-image/content/vendor/jquery/` which the content is :

    $(function() {
	console.log("Loading animals...");
	
	function loadAnimals() {
	$.getJSON( "/api/animals/", function(animals) {
				console.log(animals)
				var message = "Oh look it's a ";
				message += animals[0].animal + " it comes from the " + animals[0].type;
				$(".lead").text(message);
			});
		};
		loadAnimals();
		setInterval(loadAnimals, 3000);
	});
In this code we get some content from `/api/animals/` (animals in a json format) then we display in place of the class lead in the html page a little sentence with the name and type of the first animal found in the json. We repeat this action every 3s with the method setInterval. 
### index.html
We now just need to import our javascript in the body of the index.html like :

    <!-- custom script to get a random animal -->
    <script src="vendor/jquery/animals.js"></script>
We can note that we need to specifie where we put the animals.js file.
### Dockerfile changes
In every dockerfile we added :

    RUN apt-get update && \
	    apt-get install -y vim
To be able to use vim in the container. Cause we first started by changing the index.html live in the container.
### Build and test
This time we need to rebuild the apache_static image set our changes.

    docker build -t res/apache_php .
    docker run -d --name apache_static res/apache_php
    docker run -d --name dynamic_animals 
    docker run -d --name apache_rp -p 8080:80 res/apache_rp
We can now see the changes by accessing in our browser reverse.res.ch:8080. You still need to be careful with the container build order/address !
## Step 5: Dynamic reverse proxy configuration
The goal for this step is to make the reverse proxy configuration dynamic. As for now, the server's ip address are hard-coded in a config file and fixed when building and we'd much rather like to specified said adresses on launch rather than on build. To do so, 4 tasks have do be done. They are :

* Pass environment variables when starting a docker
* Add a setup phase in the reverse-proxy Dockerfile
* Create a script to create a template for the reverse-proxy configuration file
* Retrieve environment variables in the config file
### Passing environment variables

Docker allows use to easily pass environment variables thanks to the argument -e. The argument can be used like this :

`docker run -e <variable name>=<variable value> <image>`

We can, therefore, run our proxy with two new variables. One for the static serever address and one for the dynamic one.

`docker run -e STATIC_APP=172.17.0.5 -e DYNAMIC_APP=172.17.0.8 image`

but how does one find those addresses you might ask. We can easily retrieve the ip addresses from their conatainer using `docker inspect <container> | grep -i ipaddr`.

### Add a setup phase in the reverse-proxy Dockerfile

To do so we first look at the dockerfile provided on the php apache github [github.com/docker-library/php/](https://github.com/docker-library/php/tree/78125d0d3c32a87a05f56c12ca45778e3d4bb7c9/7.2/stretch/apache). We discover that a script apache2-foreground is launched. We'll take this opportunity to launch our own which will do the same instruction + launching a custom php script to generate the .conf files.

We understand now that the Dockerfile has two extra roles: 
* Overwrite the apache2-foreground with our own
* Replace the config files with the ones genrated from the script

Two lines in the middle of the Dockerfile will do the trick

```
COPY apache2-foreground /usr/local/bin/

COPY templates /var/apache2/templates
```


### Create a script
It's goal will be to firstly to retrieve the environment variables and the to print the config file for the reverse-proxy. The script called config-template.php will be really similar to the 001-reverse-proxy.conf desides that the hard-coded addresses become variables initialized from a call with the getenv() method which gets an environment variable value.
```PHP
<?php
	$dynamic_app = getenv("DYNAMIC_APP");
	$static_app = getenv("STATIC_APP");
?>

<VirtualHost *:80>
	ServerName reverse.res.ch

	ProxyPass '/api/animals/' 'http://<?php print "$dynamic_app"?>'
	ProxyPassReverse '/api/animals/' 'http://<?php print "$dynamic_app"?>'

	ProxyPass '/' 'http://<?php print "$static_app"?>'
	ProxyPassReverse '/' 'http://<?php print "$static_app"?>'
</VirtualHost>
```

now what's left is to call the script in the apache2-foreground file and write the output in reverse-proxy.conf. To do so, this line in the middle of the file is sufficient

 `php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf`
## Bonus step
We used Traefik to get us through the bonus step.
First step we get our static/dynamic ( step 1-4) images. Then we create a file named docker-compose.yml.
Our file :

    Version: '3'
	services:
		reverse-proxy:
			image: traefik # The official v2.0 Traefik docker image
			command: --api --docker # Enables the web UI and tells Traefik to listen to docker
			ports:
				- "80:80" # The HTTP port
				- "8080:8080" # The Web UI (enabled by --api)
			volumes:docke
				- /var/run/docker.sock:/var/run/docker.sock # So that Traefik can listen to the Docker events
		static_php:
			image: res/apache_php
			labels:
				- "traefik.backend=apache_php"
				- "traefik.frontend.rule=Host:reverse.res.ch"
				- "traefik.port=80"
		animals:
			image: res/express_dynamic_animals
			labels:
				- "traefik.backend=express_dynamic_animals"
				- "traefik.frontend.rule=Host:reverse.res.ch; PathPrefixStrip:/api/animals/"
				- "traefik.port=3000"e

In this file, each service is ran in a container. We can specify ports and hostnames with the labels. Each service needs an image to be ran.
To run a service use the command 

    docker-compose up -d <serviceName>
   or multiple instancies of the same image

    docker-compose up - --scale <serviceName>=<numberOfInstancies>
   We recommend starting by the proxy server and after the services so he can manage the links.
   

### Dynamic cluster management
We can easily see this in our docker-compose.yml that we never specified anything about the addresses of the containers. It's all managed by the reverse-proxy server Traefik provides.
### Load balancing: multiple server nodes
As stated before we can run multiple instancies of the same images.

     docker-compose up - --scale <serviceName>=<numberOfInstancies>

### Load balancing: round-robin vs sticky session
[https://docs.traefik.io/basics/#load-balancing](https://docs.traefik.io/basics/#load-balancing)
[https://docs.traefik.io/basics/#sticky-sessions](https://docs.traefik.io/basics/#sticky-sessions)
