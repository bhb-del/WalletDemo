import { useEffect,useState } from "react";
import './connect.css'
import { useWeb3React } from '@web3-react/core'

const { ethers } = require("ethers");

function UseConnect() {
    const [balance,setBalance] = useState(0.0);
    const [address,setAddress] = useState(null);
    const [chains_,setChains] = useState(null);

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const supportedChainIds= [1, 3, 4, 5, 42];

    // 1.连接钱包 (react)
   function connect() {
       if (typeof window.ethereum === "undefined"){
            alert("请安装MetaMask")
       } else {
            UseGetAccount();   
       }
    }
    //2.当检测到未连接钱包时，一进入页面就触发连接钱包 (react)
    useEffect(()=>{connect()},[])

    //获取chainId (ethers)
    async function UseGetChain(){
        provider.getNetwork()
        .then((result)=>{
            handleChainChanged(result.chainId);
        })
        .catch((error)=>{
            console.log(error)
        })
    }

    function handleChainChanged(chainId){
        if (supportedChainIds.includes(chainId)){
            setChains(chainId);
        } else {
            //bug: 打印多次
            console.log("this chain hasn't been supported yet.");
            UseAddChain()
        }
        window.ethereum.removeListener('chainChanged', UseGetChain);
    }

    //获取账户地址 (ethers)
    async function UseGetAccount(){
        await provider.send("eth_requestAccounts", [])
        .then(handleAccountsChanged)
        .catch((error) => {
            // If the request fails, the Promise will reject with an error.
             alert(error.message)
        });   
    }

    //检测用户是否锁定了账户 (web3-react) 
    const {deactivate} = useWeb3React()
    function handleAccountsChanged(accounts){
        if (accounts.length === 0) {
            // 无账号，则代表锁定了,主动断开
            deactivate()
            setAddress(null)
            setChains(null)
          } else {
              //获取账户余额
              provider.getBalance(accounts[0]).then((result) => {
              // 余额是 BigNumber (in wei)，所以需要把余额格式化为 ether 字符串
              let etherString = ethers.utils.formatEther(result);
              setBalance(etherString)
              //检测账户切换后更新账户地址
              setAddress(accounts[0])
              UseGetChain();
              });
          }
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }

    // 监听账户变化
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged',(result)=>{
        const chain = parseInt(Number(result),10);
        handleChainChanged(chain)
    });

    // 将账户地址格式化为前六后四
    function filter(val) {
        let len = val.length;
        return val.substring(0,6) + '...' + val.substring(len-4,len);
    }

    // 往用户的账户内添加不存在的网络
    async function UseAddChain(){
        try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x61' }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x61',
                      chainName: 'Binance Smart Chain Testnet',
                      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                    },
                  ],
                });
              } catch (addError) {
                // handle "add" error
                // alert("增加网络失败")
                console.log("你拒绝了增加该网络...")
              }
            }
            // handle other "switch" errors
            console.log("switchError")
          }
    }
    return (
      <div className="main">
        <button onClick={connect}> { address == null ? 'connect': filter(address) }</button>
        <p>address: {address}</p>
        <p>balance: {balance}</p>
        <p>chain: {chains_}</p>
      </div>
    );
}

export default UseConnect