setGroups('flowgraph', {
  external:['0.0.0.0/0','::/0'],
  private:['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16','FC00::/7'],
  multicast:['224.0.0.0/4']
});

var links = {};
var agingtime = 600000;

setIntervalHandler(function(now) {
  for (var link in links) {
    var info = links[link];
    if(now - info.time > agingtime) {
      delete links[link];
    }
  }
});

setFlowHandler(function(rec) {
  var [src,dst,grpsrc,grpdst] = rec.flowKeys.split(',');
  var link;
  var start;
  var grpstart;
  var end;
  var grpend;
  if(src < dst) {
    link = src+'-'+dst;
    start = src;
    end = dst;
    grpstart = grpsrc;
    grpend = grpdst;
  } else {
    link = dst+'-'+src;
    start = dst;
    end = src;
    grpstart = grpdst;
    grpend = grpsrc;
  }
  links[link] = {
    time:rec.start,
    start:start,end:end,
    grpstart:grpstart,grpend:grpend
  };
},['flowgraph-pair']);

setHttpHandler(function(req) {
  var result, key, name, path = req.path;
  if(!path || path.length === 0) throw "not_found";
  switch(path[0]) {
  case 'links':
    result = links;
    break;
  default: throw 'not_found';
  }
  return result;  
});

setFlow('flowgraph-pair',{
  keys:'ipsource,ipdestination,group:ipsource:flowgraph,group:ipdestination:flowgraph',
  value:'frames',
  log:true,flowStart:true
});
