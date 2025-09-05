import {
  getExcludeStrings,
  homeServer
} from "scripts/constants.js"

/** @param {NS} ns */
export async function main(ns) {
	ns.print("This is just a function library, it doesn't do anything.");
  //ns.print(getServerCount(ns));
}


/** @param {NS} ns **/
export function getNetworkNodes(ns) {
  // ns.ui.openTail();
	var visited = {};
	var stack = [];
	var origin = homeServer;
	stack.push(origin);

	while (stack.length > 0) {
		var node = stack.pop();
		if (!visited[node]) {
			visited[node] = node;
			var neighbours = ns.scan(node);
			for (var i = 0; i < neighbours.length; i++) {
				var child = neighbours[i];
				if (visited[child]) {
					continue;
				}
				stack.push(child);
			}
		}
	}
	return Object.keys(visited);
}

export function getNetworkNodesBFS(ns) {

  ns.disableLog("ALL");
  ns.ui.openTail();

  //initialize the queue
  var q = [];
  q.push("home");

  //initialize the visited array
  var visited = {};

  while (q.length > 0) {
    // Grab next node from queue
    let node = q.shift();
    if (!visited[node]) {
      visited[node] = node;
    }
    //return the adjacent nodes
    let adjacentNodes = ns.scan(node);

    for (var i = 0; i < adjacentNodes.length; i++) {
      var _node = adjacentNodes[i];
      if (visited[_node]) {
        continue;
      }
      // If not visited, add to queue
      q.push(_node);
    }
  }
  return Object.keys(visited);
}  

/** @param {NS} ns **/
export function penetrate(ns, server, cracks) {
	ns.print("Penetrating " + server);
	for (var file of Object.keys(cracks)) {
		if (ns.fileExists(file, homeServer)) {
			var runScript = cracks[file];
			runScript(server);
		}
	}
}

/** @param {NS} ns **/
export function getNumCracks(ns, cracks) {
	return Object.keys(cracks).filter(function (file) {
		return ns.fileExists(file, homeServer);
	}).length;
}

/** @param {NS} ns **/
export function canPenetrate(ns, server, cracks) {
	var numCracks = getNumCracks(ns, cracks);
	var reqPorts = ns.getServerNumPortsRequired(server);
	return numCracks >= reqPorts;
}

/** @param {NS} ns **/
export function hasRam(ns, server, scriptRam, useMax = false) {
	var maxRam = ns.getServerMaxRam(server);
	var usedRam = ns.getServerUsedRam(server);
	var ramAvail = useMax ? maxRam : maxRam - usedRam;
	return ramAvail > scriptRam;
}

/** @param {NS} ns **/
export function canHack(ns, server) {
	var pHackLvl = ns.getHackingLevel(); // player
	var sHackLvl = ns.getServerRequiredHackingLevel(server);
	return pHackLvl >= sHackLvl;
}

/** 
 * @param {NS} ns
 * @param {string[]} scripts
 **/
export function getTotalScriptRam(ns, scripts) {
	return scripts.reduce((sum, script) => {
		sum += ns.getScriptRam(script);
		return sum;
	}, 0)
}

/** @param {NS} ns **/
export function getRootAccess(ns, server, cracks) {
	var requiredPorts = ns.getServerNumPortsRequired(server);
	if (requiredPorts > 0) {
		penetrate(ns, server, cracks);
	}
	ns.print("Gaining root access on " + server);
	ns.nuke(server);
}


export function getThresholds(ns, node) {
	var moneyThresh = ns.getServerMaxMoney(node);
	var secThresh = ns.getServerMinSecurityLevel(node);
	return {
		moneyThresh,
		secThresh
	}
}

export async function waitForMoney(cost) {
  while (ns.getServerMoneyAvailable("home") < cost) {
    await ns.sleep(10000); // wait 10s
  }
}

export function getComparator(compareField) {
  return (a, b) => {
    if (a[compareField] > b[compareField]) {
      return -1;
    } else if (a[compareField] < b[compareField]) {
      return 1;
    } else {
      return 0;
    }
  };
}

function getStrategy(node) {
  var { moneyThresh, secThresh } = getThresholds(ns, node);
  var type = ''; // strategy name (for logging)
  var seq = []; // action sequence
  var allocation = []; // recommended allocation
  if (ns.getServerSecurityLevel(node) > secThresh) {
    type = 'weaken-seq';
    seq = ['w', 'g'];
    allocation = [0.75, 0.25];
  } else if (ns.getServerMoneyAvailable(node) < moneyThresh) {
    type = 'grow-seq';
    seq = ['w', 'g'];
    allocation = [0.65, 0.35];
  } else {
    type = 'hack-seq';
    seq = ['h', 'w', 'g', 'w'];
    allocation = [0.25, 0.25, 0.25, 0.25];
  }
  return {
    type,
    seq,
    allocation
  };
}

// ----------------------------------------------
// --------------------WIP-----------------------
// ----------------------------------------------

/** @param {NS} ns **/
export function getServerCount(ns) {
  var serverList = getNetworkNodes(ns);
  return Object.values(serverList).length
}


/** @param {NS} ns **/
export async function exponentialBackoffCapped(ns, maxIter) {
  var delay = ns.args[0];
  var iteration = 1;
  var iterTimer = 1;
  const _maxIter = maxIter;

  ns.print(delay);
  
  do {
    await ns.sleep(iterTimer * 1000);
    iterTimer === iterTimer**2;
    iteration++;
  } while (iteration < _maxIter + 1);

  while (iteration == _maxIter) {
    await ns.sleep((_maxIter**2)*1000);
  }
}

/** @param {NS} ns **/
export async function scanServerInfo(ns) {
  find_node: for (let node of getNetworkNodes(ns)) {
    for (var item in getExcludeStrings()) {
      if (String(node).includes(item)) {
        continue find_node;
      }
    }

    var grow_time = ns.getGrowTime(node);
    var hack_time = ns.getHackTime(node);
    var weaken_time = ns.getWeakenTime(node);
    // ns.tprint(node + " | Grow: " + grow_time);
    // ns.tprint(node + " | Hack: " + hack_time);
    // ns.tprint(node + " | Weaken: " + weaken_time);
  }
    await ns.asleep(1000)
}