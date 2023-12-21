import 'viem/window';
import type { Address } from 'viem';
import { autoSwarmMarketAbi } from '$lib/ts/constants/abis';
import { sendWallet } from './send';
import { addressesGetField } from '../common/addresses';

const sendMarketNewBatch = async (bzzChainId: number) => {
	const [publicClient, walletClient, walletAddress] = await sendWallet(bzzChainId);

	const autoSwarmMarket = (await addressesGetField(bzzChainId, 'AutoSwarmMarket')) as Address;

	const { request } = await publicClient.simulateContract({
		account: walletAddress,
		address: autoSwarmMarket,
		abi: autoSwarmMarketAbi,
		functionName: 'newBatch'
	});
	const hash = await walletClient.writeContract(request);
	await publicClient.waitForTransactionReceipt({ hash });
};

export { sendMarketNewBatch };
