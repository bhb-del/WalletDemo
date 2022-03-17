import { useEffect,useState } from "react";
import './connect.css'
import { useWeb3React } from '@web3-react/core'

const { ethers } = require("ethers");

function UseConnect() {
    const [balance,setBalance] = useState(0.0);
    const [address,setAddress] = useState(null);
    const [chains_,setChains] = useState([{chainId:'',name:''}])

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const supportedChainIds= [1, 3, 4, 5, 42];

    // 1.连接钱包 (react)
   function connect() {
       if (typeof window.ethereum === "undefined"){
            alert("请安装MetaMask")
       } else {
            getAccount();   
       }
    }

    //获取chainId (ethers)
    function getChain(){
        provider.getNetwork()
        .then((result)=>{
            let chains_ = [{
                chainId: result.chainId,
                name: result.name,
            }]
            if (supportedChainIds.includes(chains_[0].chainId)){
                setChains(chains_[0]);
            } else {
                //bug: 打印多次
                console.log("chain of " + result.name + " hasn't been supported yet.");
            }
            window.ethereum.removeListener('chainChanged', getChain);
        })
    }

    //获取账户地址 (ethers)
    async function getAccount(){
        await provider.send("eth_requestAccounts", [])
        .then(handleAccountsChanged)
        .catch((error) => {
            // If the request fails, the Promise will reject with an error.
             alert(error.message)
        });
        
    }

    //2.当检测到未连接钱包时，一进入页面就触发连接钱包 (react)
    useEffect(()=>{connect()},[])

    //检测用户是否锁定了账户 (web3-react) 
    const {deactivate} = useWeb3React()
    function handleAccountsChanged(accounts){
        if (accounts.length === 0) {
            // 无账号，则代表锁定了,主动断开
            deactivate()
            setAddress(null)
            setChains([{chainId:'',name:''}])
          } else {
              //获取账户余额
              provider.getBalance(accounts[0]).then((result) => {
              // 余额是 BigNumber (in wei)，所以需要把余额格式化为 ether 字符串
              let etherString = ethers.utils.formatEther(result);
              setBalance(etherString)
              //检测账户切换后更新账户地址
              setAddress(accounts[0])
              getChain();
              });
          }
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged',getChain);

    function filter(val) {
        let len = val.length;
        return val.substring(0,6) + '...' + val.substring(len-4,len);
    }

    return (
      <div className="main">
        <button onClick={connect}> { address == null ? 'connect': filter(address) }</button>
        <p>address: {address}</p>
        <p>balance: {balance}</p>
        <p>chain: {chains_.chainId}</p>
      </div>
    );
}

export default UseConnect