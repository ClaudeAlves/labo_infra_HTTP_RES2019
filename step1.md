# Step 1
## You can do a demo, where you build the image, run a container and access content from a browser.
The image of the apache server is located in the /docker-images/apache-php-image/ directory. Build it using the command 
    docker build -t res/apache_php . 
in the directory told before.
To run use the command
    docker run -d -p 9090:80 res/apache_php
and now to access it from your browser look for the ip address of your docker-machine and put it on your browser with the port written just 
before in the run command in my example i put 192.168.99.100:9090 in my browser  
## You have used a nice looking web template, different from the one shown in the webcast.
To change the template change the index.html file if you want to access another file from the browser you need to add the path at the end 
of the address:port/path/path..../file.html
## You are able to explain what you do in the Dockerfile.
When building the docker file all the files located in content/ are copied in the directory /var/www/html/
## You are able to show where the apache config files are located (in a running container).
/etc/apache2/sites-availables
## You have documented your configuration in your report.
???
