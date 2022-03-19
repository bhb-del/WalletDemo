import { useEffect, useState } from "react";
import './connect.css';
import { useWeb3React } from '@web3-react/core';
import * as ethers from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

function AddNetWork() {
    window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
            {
                chainId: '0x61',
                chainName: 'Binance Smart Chain Testnet',
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            }
        ],
    }).catch((error) => {
        if (error.code === 4001) {
            alert("You reject to add network...,it will effects your trade after.")
        }
    });
}
function SwitchNetwork(val) {
    window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: val }],
    }).catch((error) => {
        console.log(error)
    })
}

export default () => {
    const [balance, setBalance] = useState('');
    const [address, setAddress] = useState(null);
    const [chains_, setChains] = useState('');
    const supportedChainIds = ['0x1', '0x3', '0x4', '0x5', '0x2a', '0x61'];
    // 连接钱包 (react)
    function connect() {
        if (typeof window.ethereum === "undefined") {
            alert("请安装MetaMask")
        } else {
            getAccount();
        }
    }

    //当检测到未连接钱包时，一进入页面就触发连接钱包 (react)
    useEffect(() => { connect() }, [])

    //获取chainId (ethers)
    function getChain() {
        provider.getNetwork()
            .then((result) => {
                let result_: string;
                //需优化
                switch (result.chainId) {
                    case 1:
                        result_ = '0x1'
                        break;
                    case 2:
                        result_ = '0x2'
                        break;
                    case 3:
                        result_ = '0x3'
                        break;
                    case 4:
                        result_ = '0x4'
                        break;
                    case 5:
                        result_ = '0x5'
                        break;
                    case 42:
                        result_ = '0x2a'
                        break;
                    case 97:
                        result_ = '0x61'
                        break;
                }
                handleChainChanged(result_);
            })
            .catch((error) => {
                console.log(error)
            })
    }

    function handleChainChanged(chainId) {
        if (supportedChainIds.includes(chainId)) {
            setChains(chainId);
        } else {
            alert("this chain hasn't been supported yet.");
        }
    }

    //获取账户地址 (ethers)
    function getAccount() {
        provider.send("eth_requestAccounts", [])
            .then(handleAccountsChanged)
            .catch((error) => {
                // If the request fails, the Promise will reject with an error.
                alert(error.message)
            });
    }

    //检测用户是否锁定了账户 (web3-react) 
    const { deactivate } = useWeb3React()
    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // 无账号，则代表锁定了,主动断开
            deactivate()
            setAddress(null)
            setChains('')
            setBalance('')
        } else {
            //检测账户切换后更新账户地址
            setAddress(accounts[0])
            getChain();
            //获取账户余额
            provider.getBalance(accounts[0]).then((result) => {
                // 余额是 BigNumber (in wei)，所以需要把余额格式化为 ether 字符串
                let etherString = ethers.utils.formatEther(result);
                setBalance(etherString)
            });
        }
    }
    // 监听账户变化
    useEffect(() => {
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', (result) => {
            handleChainChanged(result)
        });
        return () => {
            window.ethereum.removeListener('chainChanged', getChain);
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    }, [])

    // 将账户地址格式化为前六后四
    function filter(val) {
        let len = val.length;
        return val.substring(0, 6) + '...' + val.substring(len - 4, len);
    }

    function choooseNet(event) {
        setChains(event.target.value);
        if (event.target.value === '0x61') {
            AddNetWork();
        } else {
            SwitchNetwork(event.target.value);
        }
        event.preventDefault();
    }

    return (
        <div className="main">
            <button onClick={connect}> {address == null ? 'connect' : filter(address)}</button>
            <p>address: {address}</p>
            <p>balance: {balance}</p>
            <p>chain: {chains_}</p>
            <select id="NetworkList" onChange={choooseNet} value={chains_}>
                <option value="0x1">main</option>
                <option value="0x61">BSC Testnet</option>
                <option value="0x3">Ropsten</option>
                <option value="0x4">Rinkeby</option>
                <option value="0x5">Goerli</option>
                <option value="0x2a">Kovan</option>
            </select>
        </div>
    );

}

