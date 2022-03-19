import { useEffect, useRef, useState } from "react";
import * as ethers from 'ethers'


function useNetWork() {
    try {
        AddNetWork();
    }
    // metamask 9.6.0之前的版本里，wallet_addEthereumChain不支持切换到主网；wallet_switchEthereumChain支持切换到任意钱包内已有的网络
    catch (err) {
        SwitchNetwork('0x1');
    }
}
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
    const [chain, setChain] = useState()

    function choooseNet(event) {
        setChain(event.target.value);
        if (event.target.value === '0x61') {
            AddNetWork();
        } else {
            SwitchNetwork(event.target.value);
        }
        event.preventDefault();
    }

    return (
        <div>
            <p>chain: {chain}</p>
            <select id="NetworkList" onChange={choooseNet} value={chain}>
                <option value="0x1">main</option>
                <option value="0x61">BSC Testnet</option>
                <option value="0x3">Ropsten</option>
                <option value="0x4">Rinkeby</option>
                <option value="0x5">Goerli</option>
                <option value="0x2a">Kovan</option>
            </select>
        </div>
    )
}