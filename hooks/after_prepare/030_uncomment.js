#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
 
var rootdir = process.argv[2];
 
function replace_string_in_file(filename, to_replace, replace_with) {
    var data = fs.readFileSync(filename, 'utf8');
 	
    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
}

if (rootdir) {
    // CONFIGURE HERE
    // with the names of the files that contain tokens you want 
    // replaced.  Replace files that have been copied via the prepare step.
    var filestouncomment = [
        // android
        "platforms/android/assets/www/index.html",
        // ios
        "platforms/ios/www/index.html",
    ];
    filestouncomment.forEach(function(val, index, array) {
        var fullfilename = path.join(rootdir, val);
        if (fs.existsSync(fullfilename)) {
            // CONFIGURE HERE
            // with the names of the token values. For example, 
            // below we are looking for the token 
            // /*REP*/ 'api.example.com' /*REP*/ and will replace 
            // that token
            replace_string_in_file(fullfilename, 
                "\<!--\s*(.*) \s*-->", 
                "$1");
            // ... any other configuration options
        } else {
            //console.log("missing: "+fullfilename);
        }
    });
 
}