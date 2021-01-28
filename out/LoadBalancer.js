"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//Load Balancer Parameters
var MAX_PROVIDERS = 10; //Max. Providers in the Load Balancer
var X = 1; //heartbeat check interval
var Y = 3; //max.number of parallel requests per node
////////////////////Provider CLASS///////////////////////////////////////////////
//Provider Class Start
var Provider = /** @class */ (function () {
    function Provider() {
        this.uid = Math.random().toString(36).substring(2);
    }
    Provider.prototype.get = function () {
        return this.uid;
    };
    Provider.prototype.check = function () {
        return Math.round(Math.random()) % 2; //simulate random codes - alive (1) or not (0)
    };
    return Provider;
}());
/////Provider Class End///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////LoadBalancer CLASS///////////////////////////////////////////////
//LoadBalancer Class Start
var LoadBalancer = /** @class */ (function () {
    function LoadBalancer() {
        var _this = this;
        this.heartbeatChecker = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.providerList.forEach(function (item) {
                    var currentStatus = item[0].check();
                    if (currentStatus == 1 && item[1] == 0)
                        item[1] = -1;
                    else
                        item[1] = currentStatus;
                });
                console.log("Heartbeat----> # Active Providers = ", this.providerList.filter(function (item) { return item[1] == 1; }).length);
                return [2 /*return*/];
            });
        }); };
        this.pushProvider = function (provider) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.providerList.length != MAX_PROVIDERS) {
                    this.providerList.push([provider, 1, 0]); //add to list
                    this.lastProvider = this.providerList.length;
                }
                return [2 /*return*/];
            });
        }); };
        this.registerProvider = function (provider) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.providerList.length == MAX_PROVIDERS) {
                            return [2 /*return*/, 0]; // no more Providers may be registered
                        }
                        return [4 /*yield*/, this.pushProvider(provider)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, 1];
                }
            });
        }); };
        this.getNextProvider = function () { return __awaiter(_this, void 0, void 0, function () {
            var retStr, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: //Round robin invocation
                    return [4 /*yield*/, this.moveToNextProvider()];
                    case 1:
                        _a.sent();
                        retStr = this.providerList[this.currentProvider - 1][0].get();
                        console.log("Get Next Provider --> " + retStr + "/n");
                        promise = new Promise(function (resolve, reject) {
                            resolve(retStr);
                        });
                        return [2 /*return*/, promise];
                }
            });
        }); };
        this.moveToNextProvider = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.currentProvider - 1 == this.lastProvider) {
                    this.currentProvider = this.firstProvider;
                }
                ++this.currentProvider;
                return [2 /*return*/];
            });
        }); };
        this.excludeProvider = function (uid) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.providerList.find(function (item) {
                    item[1] = item[0].get() == uid ? 0 : item[1];
                });
                return [2 /*return*/, 1];
            });
        }); };
        this.includeProvider = function (uid) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.providerList.find(function (item) {
                    item[1] = item[0].get() == uid ? 1 : item[1];
                });
                return [2 /*return*/, 1];
            });
        }); };
        this.providerList = new Array([new Provider(), 1, 0]); //a load balancer will have atleast one active provider 
        this.currentProvider = 1; //Provider-list pointer always holds a value between 1 and maxProviders
        this.lastProvider = this.firstProvider = 0; //initiate indices
        this.heartbeatTimerID = setInterval(this.heartbeatChecker, X * 1000);
    }
    LoadBalancer.getInstance = function () {
        LoadBalancer.instantiateLoadBalancer();
        return LoadBalancer.instance;
    };
    LoadBalancer.prototype.get = function () {
        var option = Math.round(Math.random()) % 2; //Switch randomly between random invocation and round robin invocation
        var retStr = "";
        if (this.sendRequest() == 0) {
            return "Cluster Capacity Limit reached. Please try again later";
        }
        if (option == 0) { //Random Invocation
            retStr = this.getRandomProvider();
        }
        else { //Round robin invocation
            this.getNextProvider().then(function (value) {
                retStr = value.valueOf();
            })
                .catch(function (error) { return retStr = "Error in moving next"; });
        }
        //Request handled and return value received, so free the capacity for future callers
        this.freeCapacity();
        return retStr;
    };
    LoadBalancer.prototype.getRandomProvider = function () {
        this.currentProvider = (0 + Math.random() * this.providerList.length) + 1; //generate random number within the count of active providers
        return this.providerList[Math.floor(this.currentProvider) - 1][0].get();
    };
    LoadBalancer.prototype.getProviderList = function () {
        return this.providerList;
    };
    LoadBalancer.prototype.getCountActiveProviders = function () {
        return this.providerList.filter(function (item) { return item[1] == 1; }).length;
    };
    LoadBalancer.prototype.sendRequest = function () {
        var providerListItem = this.providerList.find(function (item) { return (item[1] == 1 && item[2] < Y); }); //Check bandwidth availability in active Providers
        if (providerListItem == undefined)
            return 0; //All Providers are busy at the moment, cannot accept request
        else {
            providerListItem[2]++;
            return 1; //Request successfully sent to Provider
        }
    };
    LoadBalancer.prototype.freeCapacity = function () {
        var providerWithOccupiedCapacity = this.providerList.find(function (item) { return (item[1] == 1 && item[2] != 0); });
        if (providerWithOccupiedCapacity != undefined)
            providerWithOccupiedCapacity[2]--;
    };
    LoadBalancer.prototype.destroy = function () {
        clearInterval(this.heartbeatTimerID);
        console.log("Heartbeat Checker Stopped");
    };
    LoadBalancer.instantiate = function () {
        return new Promise(function (resolve, reject) {
            if (LoadBalancer.instance == null) {
                LoadBalancer.instance = new LoadBalancer();
                resolve(1);
                return;
            }
            reject("Already instantiated");
        });
    };
    LoadBalancer.instantiateLoadBalancer = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(LoadBalancer.instance == null)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, LoadBalancer.instantiate()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log("ERROR------>", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return LoadBalancer;
}());
/////LoadBalancer Class End////////////////////////////////////////////////////////////////////////////////
var caller = function (nCalls) { return __awaiter(void 0, void 0, void 0, function () {
    var retStr, loadBalancer;
    return __generator(this, function (_a) {
        retStr = "Caller...\n";
        loadBalancer = LoadBalancer.getInstance();
        retStr += "\n#Providers = " + loadBalancer.getProviderList().length + "\n";
        while (nCalls-- > 0) {
            console.log(loadBalancer.get());
        }
        return [2 /*return*/, retStr];
    });
}); };
var addProviders = function (n) { return __awaiter(void 0, void 0, void 0, function () {
    var retStr, loadBalancer;
    return __generator(this, function (_a) {
        retStr = "Add Provider...\n";
        loadBalancer = LoadBalancer.getInstance();
        while (n-- > 0) {
            loadBalancer.registerProvider(new Provider()).then(function (value) {
                retStr += "RegisterProvider return value" + value.valueOf + "\n";
            });
        }
        retStr += "#Providers = " + loadBalancer.getProviderList().length + "\n";
        return [2 /*return*/, retStr];
    });
}); };
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = console).log;
                return [4 /*yield*/, Promise.all([addProviders(2), caller(2), caller(6), addProviders(13)])];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); };
run();
LoadBalancer.getInstance().destroy();
//# sourceMappingURL=LoadBalancer.js.map