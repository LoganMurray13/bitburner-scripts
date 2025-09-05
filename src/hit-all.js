import {
  getNetworkNodes
} from "scripts/utils.js"

/** @param {NS} ns */
export async function main(ns) {
  let servCount = 0;
  for (let node of getNetworkNodes(ns)) {
    if (
      node !== "home" && 
      node !== "darkweb" &&
      node.includes("pserv") === false && 
      ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(node)
      ) {
      servCount += 1;
    }
  }

  let availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home")
  let threadCount = Math.floor(availableRam / servCount)

  if (threadCount === 0) {
    threadCount = 1;
  }

  for (let node of getNetworkNodes(ns)) {
    if (
      node !== "home" && 
      node !== "darkweb" &&
      node.includes("pserv") === false  && 
      ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(node)
      ) {
        if (
          ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(node)
          ) {
          ns.exec("scripts/base_loop.js", "home", threadCount, node)
        } else {
          ns.exec("scripts/weaken-action.js", "home", threadCount, node)
        }
      }
  }
}