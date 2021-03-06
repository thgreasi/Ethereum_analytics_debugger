var express = require('express');
var router = express.Router();
var app = require('../server.js');
var analytics = require('../analytics.js');
// var $ = require('jquery');

router.get('/', function(req, res, next) {

  analytics.getLastBlockLocally().then(block => {
    // console.log('PAOK: ' + block);
    prvAC = analytics.getPreviousAccounts();
    // console.log("ACCOUNTS: " + JSON.stringify(prvAC));
    res.render('home', { 
      title: 'Ethereum Analytics Debugger',
      lastBlock: block,
      previous_contracts_accounts: prvAC
    });
  });
});

///////////////////////////////////////////////////////////////
/////////////////////// Get Functions /////////////////////////
///////////////////////////////////////////////////////////////
analytics.getLastBlockLocally().then(block => {

});

router.post('/get', function(req, res, next) {
  var start_block = req.body.start_block;
  var end_block = req.body.end_block;
  var contract = req.body.contract;
  var nickname = req.body.nickname;
  var id_function = req.body.id_function;
  // console.log("Function: " + id_function + " , start + end: " + start_block + " - " + end_block);

  if (id_function == "1") { // GET EXPERIMENT
    var ret = checkReturnHex(contract);

    if (ret || contract == "") {
      analytics.getAccountTransactionsGasSpentClearings(start_block, end_block, ret, nickname).then(val => {
        noData = null;

        if (val[3].length < 1) {
          console.log("ASSING NoDATA");
          console.log(JSON.stringify(val));
          noData = "No available Info! Probably there are no transactions for the specified scenario.";
        }

        prvAC = analytics.getPreviousAccounts();
        analytics.getLastBlockLocally().then(block => {
          var dbData = val[3];
          var totalTransactions = 0;
          if (dbData) {
            dbData.forEach(d => {
              totalTransactions += d[2];
            });
          }

          res.render('home', { 
            title: 'Ethereum Analytics Debugger - Get Experiment',
            start: val[0],
            end: val[1],
            silentBugs: val[2],
            data: val[3],
            totalTrans: totalTransactions,
            noData: noData,
            lastBlock: block,
            previous_contracts_accounts: prvAC
          });
        });
      });
    } else {
      noData = "Contract doesn't exist.";
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Experiment',
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    }
  } else if (id_function == "2") { // GET CLEARINGS THROUGH TIME

    if (contract == "") {
      noData = "Contract doesn't exist.";
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Clearing Through Blocks',
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    } else {
      var ret = checkReturnHex(contract);
      if (ret) {
        analytics.getClearingsThroughTime(start_block, end_block, ret, nickname).then(val => {
          noData = null;

          if (val[2].length < 1) {
            console.log("ASSING NoDATA get_clearing_through_time");
            noData = "No available Info! Probably there are no transactions for the specified scenario, or the contract you specified doesn't exist.";
          }
          prvAC = analytics.getPreviousAccounts();
          analytics.getLastBlockLocally().then(block => {
            res.render('home', { 
              title: 'Ethereum Analytics Debugger - Get Clearing Through Blocks',
              start: val[0],
              end: val[1],
              clearingTT: val[2],
              noData: noData,
              lastBlock: block,
              previous_contracts_accounts: prvAC
            });
          });
        });
      } else {
        noData = "Contract doesn't exist.";
        prvAC = analytics.getPreviousAccounts();
        analytics.getLastBlockLocally().then(block => {
          res.render('home', { 
            title: 'Ethereum Analytics Debugger - Get Clearing Through Blocks',
            noData: noData,
            lastBlock: block,
            previous_contracts_accounts: prvAC
          });
        });
      }
    }
  } else if (id_function == "3") { // GET CONTRACT DETAILS
    analytics.getContractDetails(start_block, end_block).then(val => {
      noData = null;

      if (val[2].length < 1) {
        // console.log("ASSING NoDATA");
        noData = "No available Info! Probably there are no transactions for the specified scenario.";
      }
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Contract Details',
          start: val[0],
          end: val[1],
          contracts: val[2],
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    });
  } else if (id_function == "4") { // GET TRANSACTIONS PER BLOCK
    analytics.getTransactionsPerBlock(start_block, end_block).then(val => {
      noData = null;

      if (val[1].length < 1) {
        // console.log("ASSING NoDATA get_clearing_through_time");
        noData = "No available Info! Probably there are no blocks for the specified scenario.";
      }

      var start = val[0][0];
      var end = val[0][1];
      val.shift();
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Transactions Per Block',
          start: start,
          end: end,
          transactionsPerBlock: val,
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    });
  } else if (id_function == "5") { // GET GAS SPENT OF ACCOUNT
    if (contract == "") {
      noData = "Account not specified.";
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Gas Spent of Account',
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    } else {
      var ret = checkReturnHex(contract);

      if (ret) {
        analytics.getSpentGasOfAccount(start_block, end_block, ret, nickname).then(val => {
          noData = null;

          // Balance
          accountMbalance = val[2];
          // Total Gas Spent
          totalGas = val[3];
          // console.log(totalGas);
          if (totalGas == 0) {
            totalGas = "0";
          }
          // Array Block - Gas Spent
          blockGas = val[4];
          // console.log(JSON.stringify(blockGas));

          if (blockGas.length < 1) {
            noData = "No available Info! Probably there are no transactions for the specified scenario.";
          }
          // console.log("Balance " + accountMbalance);
          // console.log("totalGas " + totalGas);
          // console.log(" " + );
          prvAC = analytics.getPreviousAccounts();
          analytics.getLastBlockLocally().then(block => {
            res.render('home', {
              title: 'Ethereum Analytics Debugger - Get Gas Spent of Account',
              start: val[0],
              end: val[1],
              account: contract,
              balance: accountMbalance,
              totalGasSpent: totalGas,
              arrayBlockGasSpent: blockGas,
              noData: noData,
              lastBlock: block,
              previous_contracts_accounts: prvAC
            });
          });
        });
      } else {
        noData = "Account doesn't exist.";
        prvAC = analytics.getPreviousAccounts();
        analytics.getLastBlockLocally().then(block => {
          res.render('home', { 
            title: 'Ethereum Analytics Debugger - Get Gas Spent of Account',
            noData: noData,
            lastBlock: block,
            previous_contracts_accounts: prvAC
          });
        });
      }
    }
  } else if (id_function == "6") { // GET ACCOUNT INFO
    if (contract == "") {
      noData = "Account not specified.";
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Account Info',
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    } else {
      var ret = checkReturnHex(contract);

      if (ret) {
        analytics.getAccountInfo(start_block, end_block, ret, nickname).then(val => {
          noData = null;


          accountMbalance = val[2][0];
          totalTransactions = val[2][1];
          // Delete first element from array
          // Keep transactions
          val[2].shift();
          val[2].shift();

          // Keep Inner array
          transactionsT = val[2][0];
          // console.log(JSON.stringify(transactionsT));
          if (transactionsT.length < 1) {
            // console.log("ASSING NoDATA");
            noData = "No available Info! Probably there are no transactions for the specified scenario.";
          }
          prvAC = analytics.getPreviousAccounts();
          analytics.getLastBlockLocally().then(block => {
            res.render('home', {
              title: 'Ethereum Analytics Debugger - Get Account Info',
              start: val[0],
              end: val[1],
              account: contract,
              balance: accountMbalance,
              totalTransactions: totalTransactions,
              transactions: transactionsT,
              noData: noData,
              lastBlock: block,
              previous_contracts_accounts: prvAC
            });
          });
          
        });
      } else {
        noData = "Account doesn't exist.";
        prvAC = analytics.getPreviousAccounts();
        analytics.getLastBlockLocally().then(block => {
          res.render('home', { 
            title: 'Ethereum Analytics Debugger - Get Account Info',
            noData: noData,
            lastBlock: block,
            previous_contracts_accounts: prvAC
          });
        });
      }
    }
  } else if (id_function == "7") { // GET LAST BLOCK CLEARING
    if (contract == "") {
      noData = "Contract not specified.";
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Account Info',
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    } else {

      var ret = checkReturnHex(contract);

      if (ret) {
        analytics.getContractResults(ret, nickname).then(clearings => {
          clearings[0] = parseInt(clearings[0]);
          clearings[1] = parseInt(clearings[1]);
          clearings[2] = parseInt(clearings[2]);

          prvAC = analytics.getPreviousAccounts();
          analytics.getLastBlockLocally().then(block => {
            res.render('home', {
              title: 'Ethereum Analytics Debugger - Get Clearing',
              clearings: clearings,
              lastBlock: block,
              previous_contracts_accounts: prvAC
            });
          });
        });
      } else {
        noData = "Contract doesn't exist.";
        prvAC = analytics.getPreviousAccounts();
        analytics.getLastBlockLocally().then(block => {
          res.render('home', { 
            title: 'Ethereum Analytics Debugger - Get Clearing',
            noData: noData,
            lastBlock: block,
            previous_contracts_accounts: prvAC
          });
        });
      }

    }
  } else {
    var ret = checkReturnHex(contract);

    if (ret || contract == "") {
      analytics.getAccountTransactionsGasSpentClearings(start_block, end_block, ret, nickname).then(val => {
        noData = null;

        if (val[3].length < 1) {
          console.log("ASSING NoDATA");
          console.log(JSON.stringify(val));
          noData = "No available Info! Probably there are no transactions for the specified scenario.";
        }

        prvAC = analytics.getPreviousAccounts();
        analytics.getLastBlockLocally().then(block => {
          var dbData = val[3];
          var totalTransactions = 0;
          if (dbData) {
            dbData.forEach(d => {
              totalTransactions += d[2];
            });
          }

          res.render('home', { 
            title: 'Ethereum Analytics Debugger - Get Experiment',
            start: val[0],
            end: val[1],
            silentBugs: val[2],
            data: val[3],
            totalTrans: totalTransactions,
            noData: noData,
            lastBlock: block,
            previous_contracts_accounts: prvAC
          });
        });
      });
    } else {
      noData = "Contract doesn't exist.";
      prvAC = analytics.getPreviousAccounts();
      analytics.getLastBlockLocally().then(block => {
        res.render('home', { 
          title: 'Ethereum Analytics Debugger - Get Experiment',
          noData: noData,
          lastBlock: block,
          previous_contracts_accounts: prvAC
        });
      });
    }
  }
});


function checkReturnHex(arg) {
  prvAC = analytics.getPreviousAccounts();
  if (isHex(arg)) {
    console.log("RETURN: " + arg);
    return arg;
  } else {
    var ret = searchPrevAcc(prvAC, arg);
    if (ret) {
      console.log("RETURN: " + ret.hex);
      return ret.hex;
    } else {
      console.log("RETURN: FALSE");

      return false;
    }
  }
}

function isHex(str) {
  if (str[0] == 0 && str[1].toLowerCase() == 'x') {
    return true;
  } else {
    return false
  }
}

function searchPrevAcc(prvAC, arg) {
  var found = prvAC.find(function(element) {
    return element.name == arg;
  });

  return found;
}

// router.post('/get_balance', function(req, res, next) {
//   var account = req.body.account;

//   analytics.getBalance(account).then(val => {
//     if (val.length < 1) {
//       val = "Non-existed Account";
//     }
    
//     prvAC = analytics.getPreviousAccounts();
//     analytics.getLastBlockLocally().then(block => {
//       res.render('home', {
//         title: 'Ethereum Analytics Debugger - Get Balance',
//         account: account,
//         balance: val,
//         lastBlock: block,
//         previous_contracts_accounts: prvAC
//       });
//     });
    
//   });
// });

router.post('/get_peers', function(req, res, next) {

  analytics.getPeersNumber().then(peers => {
    // console.log("PEERS: " + peers);
    prvAC = analytics.getPreviousAccounts();
    analytics.getLastBlockLocally().then(block => {
      res.render('home', { 
        title: 'Ethereum Analytics Debugger - Get Peers',
        infoP: '1',
        peers: peers,
        lastBlock: block,
        previous_contracts_accounts: prvAC
      });
    });
  });
});


router.post('/get_block_info',function(req, res, next) {
  var block = req.body.block;

  analytics.getBlockInfoMinimal(block).then(val => {
    // console.log("INDEX");
    prvAC = analytics.getPreviousAccounts();
    analytics.getLastBlockLocally().then(block => {
      res.render('home', {
        title: 'Ethereum Analytics Debugger - Get Block Info',
        blockInfo: val,
        lastBlock: block,
        previous_contracts_accounts: prvAC
      });
    });
    
  });
});

router.get('/get_block/:block',function(req, res, next) {
  var block = req.params.block;

  analytics.getBlockInfoMinimal(block).then(val => {
    // console.log("INDEX");
    prvAC = analytics.getPreviousAccounts();
    analytics.getLastBlockLocally().then(block => {
      res.render('home', {
        title: 'Ethereum Analytics Debugger - Get Block Info',
        blockInfo: val,
        lastBlock: block,
        previous_contracts_accounts: prvAC
      });
    });
    
  });
});

router.get('/account/:acc', function(req, res, next) {
  var account = req.params.acc;
  // console.log("Account: " + JSON.stringify(account));

  analytics.getAccountInfo(1, 1, account, "").then(val => {
    noData = null;

    accountMbalance = val[2][0];
    totalTransactions = val[2][1];
    // Delete first element from array
    // Keep transactions
    val[2].shift();
    val[2].shift();

    // Keep Inner array
    transactionsT = val[2][0];
    // console.log(JSON.stringify(transactionsT));
    if (transactionsT.length < 1) {
      // console.log("ASSING NoDATA");
      noData = "No available Info! Probably there are no transactions for the specified scenario.";
    }

    prvAC = analytics.getPreviousAccounts();
    analytics.getLastBlockLocally().then(block => {
      res.render('home', {
        title: 'Ethereum Analytics Debugger - Get Account Info',
        start: val[0],
        end: val[1],
        account: account,
        balance: accountMbalance,
        totalTransactions: totalTransactions,
        transactions: transactionsT,
        noData: noData,
        lastBlock: block,
        previous_contracts_accounts: prvAC
      });
    });
    
  });
});

router.post('/get_transaction_info', function(req, res, next) {
  var hash = req.body.hash;

  analytics.getTranscationInfo(hash).then(val => {
    noData = null;

    if (val.length < 1) {
      console.log("ASSING NoDATA get_transaction_info");
      noData = "No available Info! There is no transaction with that hash.";
    }

    prvAC = analytics.getPreviousAccounts();
    analytics.getLastBlockLocally().then(block => {
      res.render('home', { 
        title: 'Ethereum Analytics Debugger - Get Transaction Info',
        transaction_info: val,
        noData: noData,
        lastBlock: block,
        previous_contracts_accounts: prvAC
      });
    });
  });
});

router.get('/get_transaction/:hash', function(req, res, next) {
  var hash = req.params.hash;
  // console.log("Account: " + JSON.stringify(account));

  analytics.getTranscationInfo(hash).then(val => {

    prvAC = analytics.getPreviousAccounts();
    analytics.getLastBlockLocally().then(block => {
      res.render('home', { 
        title: 'Ethereum Analytics Debugger - Get Transaction Info',
        transaction_info: val,
        lastBlock: block,
        previous_contracts_accounts: prvAC
      });
    });
  });
});

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////


router.post('/get_accounts', function(req, res, next) {
  var start_block = req.body.start_block;
  var end_block = req.body.end_block;

  // console.log("Start block: " + start_block);
  // console.log("End block: " + end_block);

	res.render('home', { title: 'Ethereum Analytics Debugger - Get Accounts' });
});

router.post('/get_gas_spent', function(req, res, next) {
  var account = req.body.account;
  var start_block = req.body.start_block;
  var end_block = req.body.end_block;

  // console.log("Account: " + account);
  // console.log("Start block: " + start_block);
  // console.log("End block: " + end_block);

  res.render('home', { title: 'Ethereum Analytics Debugger - Get Gas Spent' });
});


router.post('/route4', function(req, res, next) {
	var pass = req.body.password;
	

	if (pass == "paok1994") {
		// exitAll();
		res.render('home', { title: 'Ethereum Analytics Debugger - Route 4 - Success)' });
	} else {
		res.render('home', { title: 'Ethereum Analytics Debugger - Route 4 - Wrong Password)' });
	}
});

router.get('/*', function(req, res, next) {
  res.render('home', { title: 'Ethereum Analytics Debugger (wrong url, redirected to home)' });
});


module.exports = router;
