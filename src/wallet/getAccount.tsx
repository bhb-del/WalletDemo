
import { useEffect, useState } from "react";
import { useWeb3React } from '@web3-react/core'
import * as ethers from 'ethers'

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

function useInitialAccount() {
    const [account, setAccount] = useState(null);
    provider.send("eth_requestAccounts", [])
        .then((result) => {
            setAccount(result[0]);
        })
        .catch((err) => {
            console.error(err);
        });
    console.log(account)
    return account;
}

function Component() {
    const address = useInitialAccount();
    return (
        <div>address: {address}</div>
    )
}
export default Component;
