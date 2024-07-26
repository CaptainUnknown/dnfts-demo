import './Home.scss'
import {useEffect, useState} from "react";
import {useAccount, useConnect, useContractWrite} from 'wagmi'
import {avalancheFuji} from "wagmi/chains";
import {toast} from "react-toastify";
import {ethers} from "ethers";
import axios from "axios";
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import { dnftAbi } from "../../constants/ABIs/dnftAbi.js";
import {
    dNFTAddress,
    ipfsGateway,
    placeHolderMeta,
    rpcUrl,
    blockExplorer
} from "../../constants/constants.js";
import {parseAbi} from "viem";

function Home() {
    const { address } = useAccount();
    const { connectors, connect } = useConnect();
    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const [metadata, setMetadata] = useState(placeHolderMeta);
    const [fetching, setFetching] = useState(false);

    const parseName = (str) => {
        const words = str.split(' ');
        const capitalizedWords = words.map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        });
        return capitalizedWords.join(' ');
    }

    const getColor = (metadata) => {
        const colorAttribute = metadata.attributes.find((attribute) => attribute.trait_type === "Color");
        return colorAttribute?.value ?? 'blue';
    }

    const colors = ["blue", "green", "lavender", "red", "aqua", "carrot", "rouge"];
    const colorsHex = {
        blue: { backgroundColor: '#2196F3', borderColor: '#1565C0' },
        green: { backgroundColor: '#4CAF50', borderColor: '#388E3C' },
        lavender: { backgroundColor: '#9C27B0', borderColor: '#7B1FA2' },
        red: { backgroundColor: '#F44336', borderColor: '#D32F2F' },
        aqua: { backgroundColor: '#00BCD4', borderColor: '#0097A7' },
        carrot: { backgroundColor: '#FF9800', borderColor: '#F57C00' },
        rouge: { backgroundColor: '#C62828', borderColor: '#B71C1C' },
    };

    const parseAddress = (address) => {
        if (address === null || address === undefined) return "Not Logged In";
        if (address?.length <= 18) return address;
        return address.toString().slice(0, 6) + "..." + address.toString().slice(-4);
    };

    /**
     * @dev Writes
     */
    const handleUpdateNFT = async (color) => {
        setFetching(true);
        setMetadata(placeHolderMeta);
        console.log("Updating NFT");
        toast.info("Customizing the NFT");
        writeContract({
            address: dNFTAddress,
            abi: parseAbi(['function updateNFT(string[] calldata args, uint256 tokenId) view returns (uint256)']),
            functionName: "updateNFT",
            chainId: avalancheFuji.id,
            from: address,
            args: [[color.toString()], BigInt(0)],
        })
    }

    const refetchMetadata = async () => {
        setFetching(true);
        setMetadata(placeHolderMeta);
        const dNFTContract = new ethers.Contract(dNFTAddress, dnftAbi, new ethers.providers.JsonRpcProvider(rpcUrl));
        const ipfsUri = await dNFTContract.tokenURI(BigInt(0));
        const CID = ipfsUri.replace('ipfs://', '');
        try {
            const response = await axios.get(ipfsGateway + CID);
            console.log("gateway data", response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching new metadata:', error);
            toast.error("Failed to fetch metadata");
        }
    }

    useEffect(() => {
        refetchMetadata().then((data) => setMetadata(data)).then(() => setFetching(false));
    }, [])

    useEffect(() => {
        if (error) toast.error('Update Request Failed');
        else if (hash) {
            refetchMetadata().then((data) => setMetadata(data));
            setFetching(false);
            toast.success('NFT Updated!');
        }
    }, [isPending])

    return (<>
        <div className="appWrapper">
            <div className="app">
                { !address ? <div className="connectWrap">{connectors.slice(0, 1).map((connector) => (
                      <button onClick={() => connect({ connector })} type="button" className='connectButton'> Connect </button>))}</div>
                    : <div className="address">{parseAddress(address)}</div>
                }
                <h1> Sample Dynamic NFT: </h1>
                <div className="imageMeta">
                    <div className='NFTPreview'>
                        <img alt='NFT Preview' src={metadata.image} style={{ filter: fetching? "blur(10px)" : "none" }}/>
                        { address &&
                            <div className="colorColumn">
                                <div className="colorSelection">Customize:</div>
                                {colors.map((property, index) => (<>
                                    <button
                                        key={index}
                                        style={{
                                            backgroundColor: colorsHex[colors[index]].backgroundColor,
                                            border: `4px solid ${colorsHex[colors[index]].borderColor}`
                                        }}
                                        onClick={() => handleUpdateNFT(colors[index])}
                                    />
                                </>))}
                            </div>
                        }
                    </div>
                    {
                        address && !isPending && hash && <>
                            <p>Transaction Hash: <a
                                onClick={() => window.open(`${blockExplorer}/tx/${hash}`, '_blank')}
                            >
                                {hash}
                            </a></p>
                        </>
                    }
                    <div className='attributes'>
                        <h2 className="name"
                            style={{color: colorsHex[getColor(metadata)].backgroundColor}}
                        >{ parseName(metadata.name) ?? 'Not Found' }</h2>
                        <h2>Description</h2>
                        <div className="divider"></div>
                        <p>{ metadata.description ?? 'Not Found' }</p>
                        <h2 style={{ marginTop: "1rem" }}>Attributes</h2>
                        <div className="divider"></div>
                        {metadata.attributes.length === 0 ?
                            <div className="attributeProperty" style={{justifyContent: "center"}}>
                                <h1> None Found </h1>
                            </div> :
                            metadata.attributes.map((property, index) => (
                                <div
                                    className="attributeProperty" key={index}
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        margin: "0",
                                    }}
                                >
                                    <h1>{property.trait_type}: </h1>
                                    <span>{property.value}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default Home