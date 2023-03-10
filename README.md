
This is a  node js project with 3 signup options email, google and facebook.

only LoggedIn users can see the user dashboard which is made in retool . 

The google OAuth has below issue :
throws intermittent InternalOAuthErrors on fast connections

https://github.com/jaredhanson/passport-google-oauth2/issues/87

Hence i had to apply the patch and push all the modules to github.
