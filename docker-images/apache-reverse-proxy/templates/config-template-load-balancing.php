<?php
	$dynamic_app1 = getenv("DYNAMIC_APP1");
	$dynamic_app2 = getenv("DYNAMIC_APP2");
	$static_app1 = getenv("STATIC_APP1");
	$static_app2 = getenv("STATIC_APP2");
?>

<VirtualHost *:80>
	ServerName reverse.res.ch

	<Proxy "balancer://animals">
        	BalancerMember "http://<?php print $dynamic_app1 ?>"
        	BalancerMember "http://<?php print $dynamic_app2 ?>"
    	</Proxy>

	ProxyPass '/api/animals/' 'balancer://animals'
	ProxyPassReverse '/api/animals/' 'balancer://animals/'

	<Proxy "balancer://index">
        	BalancerMember "http://<?php print $static_app1 ?>"
        	BalancerMember "http://<?php print $static_app2 ?>"
   	</Proxy>

	ProxyPass '/' 'balancer://index/'
	ProxyPassReverse '/' 'balancer://index/'
</VirtualHost>
