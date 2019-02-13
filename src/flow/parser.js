class NodeFlow {
  constructor(){

  }

  add_link(from, to){

  }
}

class Parser {
  constructor(){

  }

  find_start(nodes, links){
    let entry_nodes = []
    let inputs = {}
    var nodes = {}

    for(var i = 0; i < links.length; i++){
      let link = links[i]
      nodes[link.src] = true;
      inputs[link.dst] = true;
    }

    let input = null;

    for(var node in nodes){
      let exists = false;
      for(var hasInput in inputs){
        if(hasInput == node){
          exists = true;
        }
      }

      if(!exists){
        input = node
        entry_nodes.push(node)
      }
    }
    return entry_nodes
  }

  find_node(nodes, id){
    return nodes.filter((a) => a.id == id)[0]
  }

  find_next(node, nodes, links){
    let exit_nodes = links.filter((l) => {
      return l.src == node
    }).map((link) => link.dst)

    return exit_nodes.map((node_id) => {
      let n = node_id 
      let next = this.find_next(node_id, nodes, links)
      
      if(next.length > 0){
        return [n, next]
      }else{
        return [n, null]
      }
    })
  }

  parse(chain){
    var nodes = chain.flow.nodes;
    let links = chain.flow.links;

    console.log(nodes)
    let start = this.find_start(nodes, links)
    
    let threads = []

    console.log(start)
    return start.map((x) => {
      let next = this.find_next(x, nodes, links);
      return [x, next]
    })
    
  }

}

module.exports = Parser;
