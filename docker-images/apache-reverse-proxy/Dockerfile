FROM php:7.2-apache

COPY conf/sites_available/ /etc/apache2/sites_available/

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*