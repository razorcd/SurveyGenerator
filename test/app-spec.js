//test:  jasmine-node test/app-spec.js --autotest
var request = require('request');
var cookie;
var j = request.jar();
var request = request.defaults({jar: j});
var config = require('../config.js');

var host = 'http://'+ config.host +':' + config.port;
console.log("Test running on: ", host);


describe("Test User register/login/logout:", function(){

  describe("test GET /", function() {


    it("should have a / route", function(done) {
      request.get(host, function(err,res){
        expect(res.statusCode).toBe(200);
        done();
      })
    });

    //testing request redirect response
    it("should redirect and then return status 200", function(done) {
      request.get(host+'/redirect', function(err,res){
        expect(res.statusCode).toBe(200);
        done();
      })
    });

  });


  describe("register user:", function(){

    it("should return the register window", function(done){
      request.get(host+'/register', function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/class=\"registration\"/i);
        expect(res.req.path).toBe('/register');
        done();
      })
    })


    it("should return validation error on username format", function(done){
      var form = {
        username: 'r@r.r',
        password: 'qwertyuiop'
      }

      var options = {
        url : host+"/register",
        method: "POST",
        followAllRedirects: true,
        form: form
      }

      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/username not valid/i)
        expect(res.req.path).toBe('/register');
        done();
      })
    })


    it("should return validation error on username field missing", function(done){
      var form = {
        password: 'qwertyuiop'
      }
      var options = {
        url : host+"/register",
        method: "POST",
        followAllRedirects: true,
        form: form
      }

      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/Path \`username\` is required./i);
        expect(res.req.path).toBe('/register');

        done();
      })
    })

    it("should return validation error on password format", function(done){
      var form = {
        username: 'razor',
        password: 'qwe'
      }
      var options = {
        url : host+"/register",
        method: "POST",
        followAllRedirects: true,
        form: form
      }

      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/Password not valid. Must be min 8 characters/i);
        expect(res.req.path).toBe('/register');
        done();
      })
    })


    it("should return validation error on password field missing", function(done){
      var form = {
        username: "razor"
      }
      var options = {
        url : host+"/register",
        method: "POST",
        followAllRedirects: true,
        form: form
      }

      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/Path \`password\` is required/i);
        expect(res.req.path).toBe('/register');
        done();
      })
    })


    it("should create new user", function(done){
      var form = {
                username: "razor",
                password: "qwe123qwe"
      }
      var options = {
        url : host+"/register",
        method: "POST",
        followAllRedirects: true,
        form: form
      }

      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        //exp(res.body).toMatch(/test4@test.test/i);
        expect(res.req.path).not.toBe('/register');

        //it should be logged in automaticaly
        expect(res.req.path).not.toBe('/login');

        //logout
        request.get('/logout', function(err, res){
          done();
        })
      })
    })


    it("should return error on 'User already exists'", function(done){
      var form = {
                username: 'razor',
                password: "qwe123qwe"
      }
      var options = {
        url : host+"/register",
        method: "POST",
        followAllRedirects: true,
        form: form
      }

      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/User already exists/i);
        expect(res.req.path).toBe('/register');
        done();
      })
    })

  })


  describe("login/logout user", function(){

    it("should return login window", function(done){
      request.get(host+"/login", function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/Login/i);
        expect(res.req.path).toBe('/login');
        done();
      })
    })


    it("should NOT login the nonexisting user", function(done){
      var form = {
          username: 'test4sdfsfcsctetest',
          password: "qwe12fgdsvfgdsg3qwe"
      }
      var options = {
        url : host+"/login",
        method: "POST",
        followAllRedirects: true,
        form: form
      }
      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/Can\'t find username/i);
        expect(res.req.path).toBe('/login');
        done();

      })
    })


    it("should NOT login the existing user and bad password", function(done){
      var form = {
          username: 'razor',
          password: "qwe12fgdsvfgdsgvdsvgdsv3qwe"
      }
      var options = {
        url : host+"/login",
        method: "POST",
        followAllRedirects: true,
        form: form
      }
      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/Bad password/i);
        expect(res.req.path).toBe('/login');
        done();
      })
    })


    it("should login the existing user", function(done){
      var form = {
          username: 'razor',
          password: "qwe123qwe"
      }

      var options = {
        url : host+"/login",
        method: "POST",
        followAllRedirects: true,
        form: form
      }
      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        cookie = j.getCookies(host+"/login");
        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/logintoken/i);
        expect(res.req.path).toBe('/razor');
        done();
      })
    });


    it("should stay logged in if after login was completed", function(done){
      request.get(host+'/checkLoginSession', function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        expect(res.req.path).toBe('/checkLoginSession');
        done();
      })
    });


    it("control panel should be accessible only for current user (razor)", function(done) {
       var options = {
        url : host+"/razz",
        method: "GET",
        followAllRedirects: true
      }
      request(options, function(err, res){
        expect(res.statusCode).toBe(200);
        expect(res.req.path).toBe('/razor');
        done();
      })
    });


    it("should recreate logintoken if logging in again when session already exists for current username", function(done){
      var token;
      //getting the existing logintoken
      request.get(host+'/razor', function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        cookie = j.getCookies(host+"/login");
        token = cookie[1].value;
      })

      //login again
      var form = {
          username: 'razor',
          password: "qwe123qwe"
      }

      var options = {
        url : host+"/login",
        method: "POST",
        followAllRedirects: true,
        form: form
      }
      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        cookie = j.getCookies(host+"/login");
        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/logintoken/i);
        expect(token).not.toBe(cookie[1].value);
        expect(res.req.path).toBe('/razor');
        done();
      })

    })



    it('should logout', function(done){
      request.get(host+'/logout', function(err, res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/login/i);
        cookie = j.getCookies(host+"/login");
        expect(cookie).toBeDefined();
        expect(cookie).not.toMatch(/logintoken/i);
        expect(res.req.path).toBe('/login');
        done();
      })
    })


    it("should stay logged OUT after logout was completed", function(done){
      request.get(host+'/checkLoginSession', function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.req.path).toBe('/login');
        done();
      })
    })



  })


  //TIME:0 - logging in without remember me
  describe("test user login - expirations", function() {
    
    it("should login the existing user", function(done){
      var form = {
          username: 'razor',
          password: "qwe123qwe"
          //remember_me: false
      }

      var options = {
        url : host+"/login",
        method: "POST",
        followAllRedirects: true,
        form: form
      }
      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        cookie = j.getCookies(host+"/login");
        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/logintoken/i);
        expect(res.req.path).toBe('/razor');
        console.log("\nLogged in at: ", new Date().toJSON());
        done();
      })
    })


    it("should stay logged in if after login was completed", function(done){
      request.get(host+'/checkLoginSession', function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        expect(res.req.path).toBe('/checkLoginSession');
        done();
      })
    })


    it("should have correct expirations", function(done) {
        request.get(host+'/expirations', function(err, res){
          var body = JSON.parse(res.body);
          console.log("\nSession:\n",body);

          expect(body.remember_me).toBeDefined();
          expect(body.lastTimeUsed).toBeDefined();
          expect(body.createdAt).toBeDefined();

          expect((body.createdAt + 30000)).toBeGreaterThan(Date.now()); //createdAt max 30s ago
          expect(body.createdAt).toBeLessThan(Date.now()); //createdAt before now
          expect(body.lastTimeUsed+5000).toBeGreaterThan(Date.now()); //lastTimeUsed max 5s ago
          expect(body.lastTimeUsed).toBeLessThan(Date.now()); //lastTimeUsed before now

          expect(body.remember_me-30000).toBeLessThan(Date.now()); //remember_me until over 25s
          expect(body.remember_me-20000).toBeGreaterThan(Date.now()); //remember_me is bigger than now+20s
          
          done();
        })      
    });

    //TIME: 3s  -  updating lastTimeUsed
    it("should update lasttimeused and have same expiration after using for 3 second ", function(done) {
      
      setTimeout(function(){
        request.get(host+'/checkLoginSession', function(err,res){
          console.log("/checkLoginSession request after 3s, at: ", new Date().toJSON());
          request.get(host+'/expirations', function(err, res){
            var body = JSON.parse(res.body);
            
            expect(body.lastTimeUsed+5000).toBeGreaterThan(Date.now()); //lastTimeUsed max 5s ago
            expect(body.lastTimeUsed).toBeLessThan(Date.now()); //lastTimeUsed before now
            
            done();
          })
        })


      }, 3000);

    }, 5000);   //jasmine waits for 20s before error



    //TIME: 20s - updating lastTimeUsed, remember_me still not expired
    it("should update lastTimeUsed and have same expiration after using for 17 second ", function(done) {
      
      setTimeout(function(){
        request.get(host+'/checkLoginSession', function(err,res){
          console.log("/checkLoginSession request after 20s, at: ", new Date().toJSON());
          request.get(host+'/expirations', function(err, res){
            var body = JSON.parse(res.body);
            
            expect(body.lastTimeUsed+5000).toBeGreaterThan(Date.now()); //lastTimeUsed max 5s ago
            expect(body.lastTimeUsed).toBeLessThan(Date.now()); //lastTimeUsed before now
            
            done();
          })
        })


      }, 17000);

    }, 25000);   //jasmine waits for 25s before error


    //TIME: 27s  - remember_me should be expired but lastTimeUsed < 30s   |  still loggedin
    it("should update lastTimeUsed and have same expiration after using for another 7 second ", function(done) {
      
      setTimeout(function(){

        request.get(host+'/checkLoginSession', function(err,res){
          console.log("/checkLoginSession request after 27s, at: ", new Date().toJSON());
          expect(res.body).toMatch(/Session OK/i);  //still loggedin
          
          request.get(host+'/expirations', function(err, res){
            var body = JSON.parse(res.body);
            
            expect(body.remember_me).toBeLessThan(Date.now());
            expect(body.lastTimeUsed+5000).toBeGreaterThan(Date.now()); //lastTimeUsed max 5s ago
            expect(body.lastTimeUsed).toBeLessThan(Date.now()); //lastTimeUsed before now
            
            done();
          })
          
        })


      }, 7000);

    }, 10000);   //jasmine waits for 20s before error


    //TIME: 40s  - session should be expired and user logged out
    it("should be logged out and session should be destroyed after another 13s ", function(done) {
      
      setTimeout(function(){
        request.get(host+'/checkLoginSession', function(err,res){
          console.log("/checkLoginSession request after 40s, Session destroyed at: ", new Date().toJSON());
          expect(res.statusCode).toBe(200);
          expect(res.body).not.toMatch(/Session OK/i);

          //redirected to /login and deleted cookie.logintoken
          expect(res.statusCode).toBe(200);
          cookie = j.getCookies(host+"/login");
          expect(cookie).toBeDefined();
          expect(cookie).not.toMatch(/logintoken/i);
          expect(res.req.path).toBe('/login');
          
          //session destroyed
          request.get(host+'/expirations', function(err, res){
            //var body = JSON.parse(res.body);
            expect(res.statusCode).not.toBe(200);
            expect(res.body).toMatch(/error/i);
            
            done();
          })

        })


      }, 13000);

    }, 20000);   //jasmine waits for 20s before error

  });
  


  describe("login with remember_me chacked", function() {

    it("should login the existing user", function(done){
      var form = {
          username: 'razor',
          password: "qwe123qwe",
          remember_me: true
      }

      var options = {
        url : host+"/login",
        method: "POST",
        followAllRedirects: true,
        form: form
      }
      request(options, function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        cookie = j.getCookies(host+"/login");
        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/logintoken/i);
        expect(res.req.path).toBe('/razor');
        console.log("\nLogged in (with remember_me:true) at: ", new Date().toJSON());
        done();
      })
    })


    it("should stay logged in if after login was completed", function(done){
      request.get(host+'/checkLoginSession', function(err,res){
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/session OK/i);
        expect(res.req.path).toBe('/checkLoginSession');
        done();
      })
    })


    it("should have correct expirations when remember_me was checked", function(done) {
        request.get(host+'/expirations', function(err, res){
          var body = JSON.parse(res.body);
          console.log("\nSession:\n",body);

          expect(body.remember_me).toBeDefined();
          expect(body.lastTimeUsed).toBeDefined();
          expect(body.createdAt).toBeDefined();

          expect((body.createdAt + 30000)).toBeGreaterThan(Date.now()); //createdAt max 30s ago
          expect(body.createdAt).toBeLessThan(Date.now()); //createdAt before now
          expect(body.lastTimeUsed+5000).toBeGreaterThan(Date.now()); //lastTimeUsed max 5s ago
          expect(body.lastTimeUsed).toBeLessThan(Date.now()); //lastTimeUsed before now

          expect(body.remember_me-60000*1-15000).toBeLessThan(Date.now()); //remember_me is smaller than now+1min15s
          expect(body.remember_me-45000).toBeGreaterThan(Date.now()); //remember_me is bigger than now+45s
          
          done();
        })      
    });
    

    it('should logout', function(done){
      request.get(host+'/logout', function(err, res){
        expect(res.statusCode).toBe(200);
        cookie = j.getCookies(host+"/login");
        expect(cookie).toBeDefined();
        expect(cookie).not.toMatch(/logintoken/i);
        expect(res.req.path).toBe('/login');
        done();
      })
    })


  });



});

