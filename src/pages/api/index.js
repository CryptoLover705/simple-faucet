import Faucet from '../../artifacts/contracts/Faucet.sol/Faucet.json';
import { ethers } from 'ethers';
import { verifyEthAddress } from '../../util';

const CALLER_SECRET = process.env.CALLER_SECRET;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const BSC_URL = `https://speedy-nodes-nyc.moralis.io/dd74f0e2844dca14fad48024/bsc/mainnet`;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { address } = req.body;

      const isAddressValid = verifyEthAddress(address);

      if (!isAddressValid) {
        return res.status(400).json({ error: 'Invalid wallet address.' });
      }
      const provider = new ethers.getDefaultProvider(BSC_URL);
      const wallet = new ethers.Wallet(CALLER_SECRET, provider);

      const faucet = new ethers.Contract(CONTRACT_ADDRESS, Faucet.abi, wallet);

      await faucet.withdraw(address);

      return res.status(200).json({ address });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: 'Transaction failed.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const provider = new ethers.getDefaultProvider(BSC_URL);
      const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
      return res.status(200).json({ balance: contractBalance.toString() });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }
}
