//Load Balancer Parameters
const MAX_PROVIDERS: number = 10       //Max. Providers in the Load Balancer
const X: number = 1                   //heartbeat check interval
const Y: number = 3                   //max.number of parallel requests per node

////////////////////Provider CLASS///////////////////////////////////////////////
//Provider Class Start
class Provider {
  private uid: string

  constructor() {
    this.uid = Math.random().toString(36).substring(2)
  }

  get() {
    return this.uid
  }

  check(): number {
    return Math.round(Math.random()) % 2  //simulate random codes - alive (1) or not (0)
  }
}
/////Provider Class End///////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////LoadBalancer CLASS///////////////////////////////////////////////
//LoadBalancer Class Start
class LoadBalancer {
  static instance: LoadBalancer
  private providerList: Array<[Provider, number, number]>  //List of tuples of [Provider, state -active(1) or inactve(0), #requests (limited to Y)]
  private heartbeatTimerID: number

  firstProvider: number           //Provider-list head index
  lastProvider: number            //Provider-list tail index
  currentProvider: number         //Provider-list pointer
  countProviders: number          //count of active Provider list items

  private constructor() {
    this.providerList = new Array([new Provider(), 1, 0])                   //a load balancer will have atleast one active provider 
    this.countProviders = this.currentProvider = 1                          //Provider-list pointer always holds a value between 1 and maxProviders
    this.lastProvider = this.firstProvider = 0                              //initiate indices
    this.heartbeatTimerID = setInterval(this.heartbeatChecker, X * 1000)
  }

  private static instantiate = () =>
    new Promise<number>((resolve, reject) => {
      if (LoadBalancer.instance == null) {
        LoadBalancer.instance = new LoadBalancer()
        resolve(1)
        return
      }
      reject("Already instantiated")
    });

  public static instantiateLoadBalancer = async () => {
    if (LoadBalancer.instance == null) {
      try {
        await LoadBalancer.instantiate()
      } catch (err) {
        console.log("ERROR------>", err)
      }
    }
  }

  public static getInstance() {
    LoadBalancer.instantiateLoadBalancer()
    return LoadBalancer.instance
  }

  private heartbeatChecker = async () => {

    this.providerList.forEach(item => {
      let currentStatus: number = item[0].check()
      if (currentStatus == 1 && item[1] == 0)
        item[1] = -1
      else
        item[1] = currentStatus
    });
    console.log("Heartbeat----> # Active Providers = ", this.providerList.filter(item => item[1] == 1).length)
  }

  private pushProvider = async (provider: Provider) => {
    if (this.countProviders != MAX_PROVIDERS) {
      this.lastProvider = this.countProviders++
      this.providerList.push([provider, 1, 0]) //add to list
    }
  }

  public registerProvider = async (provider: Provider): Promise<number> => {
    if (this.countProviders == MAX_PROVIDERS) {
      return 0 // no more Providers may be registered
    }
    await this.pushProvider(provider)
    return 1
  }

  get(): string {
    let option: number = Math.round(Math.random()) % 2       //Switch randomly between random invocation and round robin invocation
    let retStr: string = ""

    if (this.sendRequest() == 0) {
      return "Cluster Capacity Limit reached. Please try again later"
    }

    if (option == 0) {                                        //Random Invocation
      retStr = this.getRandomProvider()
    }
    else {                                                   //Round robin invocation
      this.getNextProvider().then((value) => {
        retStr = value.valueOf()
      })
        .catch((error) => retStr = "Error in moving next")
    }

    //Request handled and return value received, so free the capacity for future callers
    this.freeCapacity()

    return retStr
  }

  private getRandomProvider(): string {

    this.currentProvider = (0 + Math.random() * this.countProviders) + 1             //generate random number within the count of active providers
    return this.providerList[Math.floor(this.currentProvider) - 1][0].get()
  }

  private getNextProvider = async (): Promise<string> => {                                                //Round robin invocation
    await this.moveToNextProvider()

    let retStr: string = this.providerList[this.currentProvider - 1][0].get()
    console.log("Get Next Provider --> " + retStr + "/n")
    let promise: Promise<string> = new Promise((resolve, reject) => {
      resolve(retStr)
    })

    return promise
  }

  private moveToNextProvider = async () => {
    if (this.currentProvider - 1 == this.lastProvider) {
      this.currentProvider = this.firstProvider
    }
    ++this.currentProvider
  }

  public excludeProvider = async (uid: string): Promise<number> => {
    this.providerList.find(item => {
      item[1] = item[0].get() == uid ? 0 : item[1]
    });

    return 1
  }

  public includeProvider = async (uid: string): Promise<number> => {
    this.providerList.find(item => {
      item[1] = item[0].get() == uid ? 1 : item[1]
    });

    return 1
  }

  public getProviderList(): Array<[Provider, number, number]> {
    return this.providerList
  }

  public getCountActiveProviders(): number {
    return this.providerList.filter(item => item[1] == 1).length
  }

  private sendRequest(): number {

    let providerListItem = this.providerList.find(item => (item[1] == 1 && item[2] < Y))  //Check bandwidth availability in active Providers

    if (providerListItem == undefined)
      return 0                              //All Providers are busy at the moment, cannot accept request
    else {
      providerListItem[2]++
      return 1                              //Request successfully sent to Provider
    }
  }

  private freeCapacity() {

    let providerWithOccupiedCapacity = this.providerList.find(item => (item[1] == 1 && item[2] != 0))
    if (providerWithOccupiedCapacity != undefined)
      providerWithOccupiedCapacity[2]--

  }

  public destroy() {
    clearInterval(this.heartbeatTimerID)
    console.log("Heartbeat Checker Stopped")
  }

}
/////LoadBalancer Class End////////////////////////////////////////////////////////////////////////////////

const caller = async (nCalls: number): Promise<string> => {
  let retStr: string = "Caller...\n"

  let loadBalancer = LoadBalancer.getInstance()

  retStr += "\n#Providers = " + loadBalancer.getProviderList().length + "\n"

  while (nCalls-- > 0) {
    console.log(loadBalancer.get())
  }

  return retStr
}

const addProviders = async (n: number): Promise<string> => {
  let retStr: string = "Add Provider...\n"
  let loadBalancer = LoadBalancer.getInstance()

  while (n-- > 0) {
    loadBalancer.registerProvider(new Provider()).then((value) => {
      retStr += "RegisterProvider return value" + value.valueOf + "\n"
    })
  }
  retStr += "#Providers = " + loadBalancer.getProviderList().length + "\n"

  return retStr
}


const run = async () => {
  console.log(await Promise.all([addProviders(2), caller(2), caller(6), addProviders(13)]))
}
run()
LoadBalancer.getInstance().destroy()