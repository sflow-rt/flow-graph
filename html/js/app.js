$(function() {
  var linksURL = '../scripts/graph.js/links/json';
  var hosts = {};
  var links = {};
  var nodes;
  var edges;
  var network;

  function addLink(link,from,to) {
    links[link] = link;
    edges.add({
      id:link,
      from:from,
      to:to 
    });
  }
  function removeLink(link) {
    delete links[link];
    edges.remove({id:link}); 
  }
  function addHost(host,group) {
    hosts[host] = host;
    nodes.add({
      id: host,
      label: host,
      group:group
    });
  }
  function removeHost(host) {
    delete hosts[host];
    nodes.remove({id:host}); 
  }
  function updateLinks(data) {
    var new_hosts = {};
    var new_links = {};
    for(var link in data) {
      var info = data[link];
      new_hosts[info.start] = info.start;
      new_hosts[info.end] = info.end;
      new_links[link] = link;
      if(!hosts[info.start]) addHost(info.start,info.grpstart);
      if(!hosts[info.end]) addHost(info.end,info.grpend);
      if(!links[link]) addLink(link,info.start,info.end);
    }
    for(var link in links) {
      if(!new_links[link]) removeLink(link);
    }
    for(var host in hosts) {
      if(!new_hosts[host]) removeHost(host);
    }
  } 

  var timeout_poll;
  function pollLinks() {
    $.ajax({
       url:linksURL,
       dataType:'json',
       success: function(data) {
         updateLinks(data);
         timeout_poll = setTimeout(pollLinks, 2000);
       },
       error: function(result,status,errorThrown) {
         timeout_poll = setTimeout(pollLinks, 2000);
       },
       timeout: 60000
     }); 
  };

  nodes = new vis.DataSet([]);
  edges = new vis.DataSet([]);

  var container = document.getElementById('mynetwork');

  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {
    physics:{
      solver:'repulsion'
    },
    groups: {
      external: {color:{background:'#FF6666'}},
      private: {color:{background:'#33CC33'}},
      multicast: {color:{background:'#FFFF00'}}
    }
  };
  network = new vis.Network(container, data, options);

  pollLinks();
});
