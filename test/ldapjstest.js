var ldap = require('ldapjs');

var server = ldap.createServer();

server.search('o=example', function(req, res, next) {
    
    console.log(req);
    console.log(res);
    console.log(next);
  var obj = {
    dn: req.dn.toString(),
    attributes: {
      objectclass: ['organization', 'top'],
      o: 'example'
    }
  };

  if (req.filter.matches(obj.attributes))
    res.send(obj);

  res.end();
});

server.listen(1389, function() {
  console.log('LDAP server listening at %s', server.url);
});