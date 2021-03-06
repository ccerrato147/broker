const path = require('path')
const { expect, rewire, sinon } = require('test/test-helper')

const BrokerDaemonClient = rewire(path.resolve(__dirname))

describe('BrokerDaemonClient', () => {
  let broker
  let protoStub
  let adminStub
  let orderStub
  let orderbookStub
  let walletStub
  let callerStub
  let readFileSyncStub
  let createInsecureStub
  let createSslStub
  let joinStub
  let loadConfigStub
  let address
  let consoleStub
  let certPath
  let certFile
  let credentialStub
  let combineCredentialsStub
  let generateAuthCredentialsStub
  let sslCredential
  let callCredential
  let infoStub

  beforeEach(() => {
    address = '172.0.0.1:27492'
    certPath = '/my/cert/path.cert'
    certFile = 'mycertfile'
    sslCredential = 'sslcred'
    callCredential = 'callcred'

    credentialStub = sinon.stub()
    callerStub = sinon.stub()
    adminStub = sinon.stub()
    orderStub = sinon.stub()
    orderbookStub = sinon.stub()
    walletStub = sinon.stub()
    infoStub = sinon.stub()

    protoStub = sinon.stub().returns({
      AdminService: adminStub,
      OrderService: orderStub,
      OrderBookService: orderbookStub,
      WalletService: walletStub,
      InfoService: infoStub
    })
    readFileSyncStub = sinon.stub().returns(certFile)
    createInsecureStub = sinon.stub().returns(credentialStub)
    createSslStub = sinon.stub().returns(sslCredential)
    joinStub = sinon.stub().returns(certPath)
    loadConfigStub = sinon.stub()
    consoleStub = { warn: sinon.stub() }
    combineCredentialsStub = sinon.stub()
    generateAuthCredentialsStub = sinon.stub().returns(callCredential)

    BrokerDaemonClient.__set__('loadConfig', loadConfigStub)
    BrokerDaemonClient.__set__('console', consoleStub)
    BrokerDaemonClient.__set__('loadProto', protoStub)
    BrokerDaemonClient.__set__('caller', callerStub)
    BrokerDaemonClient.__set__('readFileSync', readFileSyncStub)
    BrokerDaemonClient.__set__('path', { join: joinStub })
    BrokerDaemonClient.__set__('basicAuth', {
      generateBasicAuthCredentials: generateAuthCredentialsStub
    })
    BrokerDaemonClient.__set__('grpc', {
      credentials: {
        createInsecure: createInsecureStub,
        combineChannelCredentials: combineCredentialsStub,
        createSsl: createSslStub
      }
    })
  })

  beforeEach(() => {
    loadConfigStub.returns({
      rpcAddress: address,
      rpcCert: certPath,
      disableAuth: true
    })
  })

  it('loads a proto file', () => {
    const protoPath = BrokerDaemonClient.__get__('PROTO_PATH')
    broker = new BrokerDaemonClient()
    expect(protoStub).to.have.been.calledWith(protoPath)
  })

  describe('authentication', () => {
    let broker
    let rpcUser
    let rpcPass

    beforeEach(() => {
      rpcUser = 'sparkswap'
      rpcPass = 'passwd'

      loadConfigStub.returns({
        rpcAddress: address,
        rpcCert: certPath,
        disableAuth: false,
        rpcUser,
        rpcPass
      })
    })

    it('reads a cert file', () => {
      broker = new BrokerDaemonClient()
      expect(readFileSyncStub).to.have.been.calledWith(certPath)
    })

    it('creates ssl credentials', () => {
      broker = new BrokerDaemonClient()
      expect(createSslStub).to.have.been.calledWith(certFile)
    })

    it('creates basic authorization credentials', () => {
      broker = new BrokerDaemonClient()
      expect(generateAuthCredentialsStub).to.have.been.calledWith(rpcUser, rpcPass)
    })

    it('adds credentials to the broker daemon client', () => {
      broker = new BrokerDaemonClient()
      expect(combineCredentialsStub).to.have.been.calledWith(sslCredential, callCredential)
    })

    context('auth is disabled', () => {
      it('creates insecure credentials', () => {
        loadConfigStub.returns({ rpcAddress: address, disableAuth: true })
        broker = new BrokerDaemonClient()
        expect(createInsecureStub).to.have.been.calledOnce()
        expect(broker.disableAuth).to.be.true()
      })
    })
  })

  describe('services', () => {
    beforeEach(() => {
      broker = new BrokerDaemonClient()
    })

    it('creates an adminService', () => expect(callerStub).to.have.been.calledWith(broker.address, adminStub, credentialStub))
    it('creates an orderService', () => expect(callerStub).to.have.been.calledWith(broker.address, orderStub, credentialStub))
    it('creates an orderBookService', () => expect(callerStub).to.have.been.calledWith(broker.address, orderbookStub, credentialStub))
    it('creates an walletService', () => expect(callerStub).to.have.been.calledWith(broker.address, walletStub, credentialStub))
    it('creates an infoService', () => expect(callerStub).to.have.been.calledWith(broker.address, infoStub, credentialStub))
  })

  describe('address', () => {
    it('defaults to CONFIG if an address is not passed in', () => {
      broker = new BrokerDaemonClient()
      expect(broker.address).to.eql(address)
    })

    it('defaults the port number if no port number is specified', () => {
      const providedHost = '127.1.1.5'
      const defaultPort = BrokerDaemonClient.__get__('DEFAULT_RPC_PORT')
      broker = new BrokerDaemonClient(providedHost)
      expect(broker.address).to.eql(`${providedHost}:${defaultPort}`)
    })

    it('uses a provided address', () => {
      const providedHost = '127.0.0.2:10009'
      broker = new BrokerDaemonClient(providedHost)
      expect(broker.address).to.eql(providedHost)
    })
  })
})
