/** @param {NS} ns **/
export async function main(ns) {
    // How many levels to buy at once
    var numLevels = 10;
    // How much money to keep around for buying upgrades, etc.
    // Start with current player amount.  Will grow over time with each purchase.
    var minMoney = ns.getPlayer().money;

    // Setup
    var cost, purchased, usableMoney;
    var net = ns.hacknet;

    while (true) {
        // Check our cash situation
        usableMoney = Math.max(0, ns.getPlayer().money - minMoney);
        // Track if anything changes
        purchased = false;

        // Can we buy a node?
        var nodeCost = net.getPurchaseNodeCost();
        if (nodeCost < usableMoney) {
            // Yep, let's rock
            net.purchaseNode();
            ns.toast('HackNet node purchased: $' + format(nodeCost));
            minMoney += nodeCost / 2;
            purchased = true;
            
        } else {
            // Find cheapest upgrade of each type
            var minCost = Infinity;
            var node = null;
            var type = null;
            // Run all nodes & analyze
            for (var n = 0; n < net.numNodes(); n++) {
                // Check ram upgrade cost
                cost = net.getRamUpgradeCost(n, 1);
                if (cost < minCost) {
                    node = n;
                    minCost = cost;
                    type = 'ram';
                }
                // Check level upgrade cost
                cost = net.getLevelUpgradeCost(n, numLevels);
                if (cost < minCost) {
                    node = n;
                    minCost = cost;
                    type = 'level';
                }
                // Check cpu upgrade cost
                cost = net.getCoreUpgradeCost(n, 1);
                if (cost < minCost) {
                    node = n;
                    minCost = cost;
                    type = 'cpu';
                }
                cost = net.getCacheUpgradeCost(n, 1);
                if(cost < minCost){
                    node = n;
                    minCost = cost;
                    type = 'cache';
                }
            }
            
            if (type && minCost < usableMoney) {
                // Have something to buy!
                if (type == 'ram') {
                    net.upgradeRam(node, 1);
                } else if (type == 'level') {
                    net.upgradeLevel(node, numLevels);
                } else if (type == 'cpu') {
                    net.upgradeCore(node, 1);
                } else if(type == 'cache'){
                    net.upgradeCache(node, 1);
                }
                ns.toast('Upgrading HackNet ' + node + ' ' + type + ' for $' + format(minCost));
                minMoney += minCost / 2;
                purchased = true;
            }
        }
        
        // And sleep for a bit
        await ns.sleep(purchased ? 2000 : 30000);
    }
}

function format(num) {
    return (Math.round(num * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}